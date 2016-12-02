/**
 * Created by darryl on 2016-11-24.
 */

// ---- REQUIRES ---- //
var express     = require('express');
var router      = express.Router({ mergeParams: true });
var bcrypt      = require('bcrypt');
var sanitize    = require('../chord_api').sanitize;
var Validator   = require('validatorjs');

// Setup db models
var User        = require('./../models/user-model');
var UserCookies = require('./../models/usercookie-model');
var ChordSheet  = require('../models/chordsheet-model');


// ---- CONSTANTS ---- //
const saltRound = 10;
const cookieName = "token";


// ---- ROUTES ---- //

// Login user
router.post("/login", function(req, res, next) {
    var token = req.signedCookies.token;
    var username = sanitize(req.body.username);
    var password = req.body.password;


    // Common callbacks
    var badToken    = function(){res.send({success: false})};
    var goodToken   = function(user){res.send({success: true, username: user.username, firstname: user.firstname, lastname: user.lastname})};


    // Login by token
    if (token) {
        getTokenOwner(token).then(goodToken, badToken);
    }

    // Login by user/pass
    else if (username && password) {

        // Emails only
        if (new Validator({username: username}, {username: 'required|email'}).fails()) return res.send({success: false, reason: "Valid email address for username required."});

        var compareFunc = function(users) {
            // Make sure a user was returned
            if(users.length == 0) badToken();
            else {
                var user = users[0];

                // Compare the passed password and the hashed password for validity.
                bcrypt.compare(password, user.password, function (err, bRes) {
                    if (bRes == true) {
                        // Set the cookie before sending the success response
                        var setCookie = function(cookie) {
                            res.cookie(
                                cookieName,
                                cookie.token,
                                {
                                    maxAge: 1000 * 60 * 60 * 24,
                                    signed: true,
                                    httpOnly: true
                                }); // Expires in 24 hrs.
                            goodToken(user);
                        };

                        // Generate and store a new cookie
                        setToken(user.username).then(setCookie, function(err){res.send({success: false, reason: err.message})});
                    }
                    else res.send({success: false});
                });
            }
        };

        getUserInfo(username, true).then(compareFunc, badToken);
    }
    // Bad form, reject
    else {
        // NOTE: Do not set 400 on this, it causes issues on front end.
        res.send({success: false});
    }
});

router.get("/logout", function(req, res, next) {
    // NOTE: Since the backend isn't keeping track of session variables, no req.session work is necessary.
    res.clearCookie(cookieName);
    res.redirect('/');
});

// Create new user
router.post('/', function(req, res, next) {
    var createUser = function (users) {          // TODO: Refactor with user-exists to avoid repetition.
        if (users.length != 0) res.send({success: false, reason: "User already exists."});
        else {
            // Hash password
            bcrypt.hash(req.body.password, saltRound, function (err, hash) {
                if (err) {res.status(500).send({success: false, reason: "Hashing error."})}
                else {
                    user.password = hash;
                    user.save(function(err, mongoRes){
                        if (!err) res.send({success: true});
                        else res.status(500).send({success: false, reason: "Error saving new user."});
                    });
                }
            });
        }
    };

    // Emails only
    if (new Validator({username: req.body.username}, {username: 'required|email'}).fails(result=>{
            console.log(result);
    return res.send({success: false, reason: "Valid email address for username required."});
}))
    {
        console.log('ok');
        console
        return res.send({success: false, reason: "Valid email address for username required."});
    }

    // Create user and set up initial info
    var user = new User();
    user.username = sanitize(req.body.username);
    user.firstname = sanitize(req.body.firstname);
    user.lastname = sanitize(req.body.lastname);

    // Make sure all info was received
    if (!user.username || !user.firstname || !user.lastname) return res.status(400).send({success: false, reason: "Missing parameter."});

    // Create user if does not already exist
    getUserInfo(user.username, false, false).then(createUser, function(){res.status(500).send({success: false, reason: "Problem accessing DB."})});
});


router.route('/:username')
    // Get user information
    .get(function (req, res, next) {
        var username = sanitize(req.params.username);

        getUserInfo(username, false).then(function (users) {res.send(users)}, function (err) {res.status(500).send({success: false, reason: err.message})});
    })

    // Update user information
    .post(function (req, res, next) {        // TODO: No permission controls yet!

        // Get the variables. If they don't exist or are empty, they will be ignored.
        var username    = sanitize(req.params.username);
        var firstname   = sanitize(req.body.firstname);
        var lastname    = sanitize(req.body.lastname);
        var password    = req.body.password;

        // Update the user data and re-input
        var update = function (users) {
            if (users.length == 0) res.send({success: false, reason: "User not found."});
            else {
                var user = users[0];
                user.password = (!password || bcrypt.compareSync(password, user.password)) ? user.password : bcrypt.hashSync(password, saltRound);
                user.firstname = (!firstname) ? user.firstname : firstname;
                user.lastname = (!lastname) ? user.lastname : lastname;

                // Save the modified user
                user.save(function (err, uRes) {
                    if (!err) res.send({success: true});
                    else res.status(500).send({success: false, reason: "DB update failed."});
                });
            }
        };

        getUserInfo(username, true, false)
            .then(
                update,
                function (err) {
                    res.status(500).send({success: false, reason: err.message})});
    })

    // Delete user
    .delete(function (req, res, next) {      // TODO: No permission controls yet!
        var username = sanitize(req.params.username);

        // Get user, and delete.
        // Delete user cookies, and delete user chordsheets
        getUserInfo(username, false, true).remove().exec();
        UserCookies.find({owner: username}).remove().exec();
        ChordSheet.find({owner: username}).remove().exec();

        // Tell user success
        res.send({success: true});
    });


// ---- HELPER FUNCTIONS ---- //

/** Gets the information for a specified user.
 *
 * @param username          The user to retrieve.
 * @param addpass           Specify if the password should be retrieved as well.
 * @param reject           function(err) called when the function fails. Contains error object.
 * @param resolve           function(user) called when the function succeeds. Contains a list of user objects. Can be empty list.
 * @param returnQueryObj    Specifies if the mongoose object should be returned instead of executing. failure/success not called if true.
 * @returns {Promise|Query} Returns Promise, or Query when returnQueryObj == true
 */
var getUserInfo = function (username, addpass, returnQueryObj) {
    var selectStmt = (addpass) ? "username firstname lastname password" : "username firstname lastname";

    var query = User.find({})
        .where("username").equals(username)
        .limit(1)
        .select(selectStmt);

    // Return query if requested, otherwise execute
    if (returnQueryObj)
        return query;
    else
        return new Promise(function (resolve, reject) {
            query.exec(function (err, users) {
                if (err) reject(Error("Query failed."));
                else resolve(users);
            });
        });
};

/** Sets a new cookie for a user.
 *
 * @param username  The username to get the new cookie.
 * @param reject   function(err) Called when setting the cookie fails. Contains error object.
 * @param resolve   function(user) Called when setting cookie suceeds. Contains cookie object.
 * @returns {Promise}
 */
var setToken = function(username) {
    return new Promise(function (resolve, reject) {
        // Create token
        var newCookie = new UserCookies();
        newCookie.token = getRandomInt();
        newCookie.owner = username;

        // Save cookie
        newCookie.save(function (err, res) {
            if (!err) resolve(res);
            else reject(Error("Token could not be saved."));
        });
    });
};

/** Get user associated with token.
 *
 * @param token     The token to search for.
 * @param reject   function(err) Called when finding the cookie owner details fails. Contains error text.
 * @param resolve   function(user) Called when finding the cookie owner succeeds. Contains the owner's details.
 * @returns {Promise}
 */
var getTokenOwner = function(token) {
    return new Promise(function (resolve, reject) {
        // Check returned token for validity, and ensure user still exists
        var stillExists = function (tokenEntry) {
            if (tokenEntry.length == 0) reject(Error("No token found."));
            else if (tokenEntry.length > 1) reject(Error("Duplicate tokens were generated."));
            else {
                var tokenE = tokenEntry[0];

                // Ensure user still exists
                var userExists = function (users) {
                    if (users.length != 1) reject(Error("User for token does not exist."));
                    else resolve(users[0]);
                };

                getUserInfo(tokenE.owner, false, false).then(userExists, reject);
            }
        };

        // Get token
        UserCookies.find({})
            .where('token').equals(token)
            .select('owner')
            .exec(function (err, tokenEntry) {
                if (err) reject(Error("Error connecting to DB for token search."));
                else stillExists(tokenEntry);
            });
    });
};

/** Get a random int between 0 and 9999999999 (exclusive).
 *
 * @returns {number}
 */
var getRandomInt = function () {
    min = 0;
    max = 9999999999;
    return Math.floor(Math.random() * (max - min)) + min;
};

module.exports.router = router;
module.exports.getTokenOwner = getTokenOwner;