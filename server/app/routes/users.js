"use strict";
/**
 * Created by darryl on 2016-11-24.
 */


// ---- REQUIRES ---- //
let express     = require('express');
let router      = express.Router({ mergeParams: true });
let bcrypt      = require('bcrypt');
let session     = require('express-session');
let sanitize    = require('../chord_api').sanitize;
let MongoClient = require('mongodb').MongoClient;

// Setup db models
let User        = require('./../models/user-model');
let ChordSheet  = require('../models/chordsheet-model');


// ---- CONSTANTS ---- //

const saltRound = 10;


// ---- ROUTES ---- //

/** Login user */
router.post("/login", function (req, res, next) {
    let loggedin = req.session.loggedin;
    let username = sanitize(req.body.username);
    let password = req.body.password;   // Don't sanitize, will get only get hashed anyways


    // Common callbacks
    let badLogin = function () {
        res.send({success: false})
    };
    let goodLogin = function (user) {
        res.send({success: true, username: user.username, firstname: user.firstname, lastname: user.lastname})
    };


    // Login by token
    if (loggedin)
        goodLogin(req.session.user);

    // Login by user/pass
    else if (typeof username === "string" && typeof password === "string") {

        // Ensure user only uses a username that is an email
        if (!validateEmail(sanitize(req.body.username)))
            return res.send({success: false, reason: "The username must be an email."});

        getUserInfo(username, true).then(users => {
            // Make sure a user was returned
            if (users.length == 0)
                return badLogin();

            let user = users[0];

            // Compare the passed password and the hashed password for validity.
            bcrypt.compare(password, user.password, (err, bRes) => {
                if (bRes == true) {

                    // Set the session variables before sending the success response
                    req.session.loggedin = true;
                    req.session.user = {
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname
                    };

                    goodLogin(req.session.user);
                }
                else res.send({success: false});
            });
        }, badLogin);
    }

    // Bad form, reject
    else
        res.send({success: false}); // NOTE: Do not set 400 on this, it causes issues on front end.
});


/** Logout */
router.get("/logout", function(req, res, next) {
    // Destroy the session and redirect
    req.session.destroy();
    res.redirect('/');
});


/** Create new user */
router.post('/', function (req, res, next) {

    // Make sure all info was received
    if (typeof (req.body.username) !== "string" ||
        typeof (req.body.firstname) !== "string" ||
        typeof (req.body.lastname) !== "string")
        return res.status(400).send({success: false, reason: "Missing parameter."});

    // Ensure user only creates a username that is an email
    if (!validateEmail(sanitize(req.body.username)))
        return res.send({success: false, reason: "The username must be an email."});

    // Create user and set up initial info
    let user = new User();
    user.username = sanitize(req.body.username);
    user.firstname = sanitize(req.body.firstname);
    user.lastname = sanitize(req.body.lastname);

    let password = req.body.password;   // Don't sanitize, this is just getting hashed anyways

    // Create user if does not already exist
    getUserInfo(user.username, false, false).then(
        users => {
            // Make sure user does not exist
            if (users.length != 0)
                return res.send({success: false, reason: "User already exists."});

            // Hash password
            bcrypt.hash(password, saltRound, function (err, hash) {
                if (err)
                    return res.status(500).send({success: false, reason: "Hashing error."});

                // Store user
                user.password = hash;
                user.save().then(
                    results => {
                        // Set the session variables before sending the success response
                        req.session.loggedin = true;
                        req.session.user = {
                            username: user.username,
                            firstname: user.firstname,
                            lastname: user.lastname
                        };

                        res.send({success: true});
                    }, err => res.status(500).send({success: false, reason: "Error saving new user."})
                );
            });

        }, err => res.status(500).send({success: false, reason: "Problem accessing DB."}));
});


router.route('/:username')

    /** Get user information */
    .get(function (req, res, next) {
        // Make sure all info was received
        if (typeof (req.body.username) !== "string")
            return res.status(400).send({success: false, reason: "Missing parameter."});

        let username = sanitize(req.params.username);

        // Don't allow unauthenticated users access to other user basic details.
        if (!req.session.loggedin)
            return res.status(401).send({success: false, reason: "Unauthorized."});

        getUserInfo(username, false).then(
            users => res.send(users[0]),
            err => res.status(500).send({success: false, reason: err})
        );
    })

    /** Update user information */
    .post(function (req, res, next) {

        // Get the variables. If they don't exist or are empty, they will be ignored.
        let username    = sanitize(req.params.username);
        let firstname   = sanitize(req.body.firstname);
        let lastname    = sanitize(req.body.lastname);
        let password    = req.body.password;    // Don't sanitize

        // Only update your own information when logged in
        if (!req.session.loggedin)
            return res.status(401).send({success: false, reason: "Unauthorized."});
        if (req.session.user.username !== username)
            return res.status(403).send({success: false, reason: "You cannot change the details of another user."});

        // Update the user data and re-input
        getUserInfo(username, true, false).then(
            users => {
                if (users.length == 0)
                    return res.send({success: false, reason: "User not found."});

                let user        = users[0];
                user.password   = (typeof (password) !== "string" || bcrypt.compareSync(password, user.password)) ? user.password : bcrypt.hashSync(password, saltRound);
                user.firstname  = (typeof (firstname) !== "string") ? user.firstname : firstname;
                user.lastname   = (typeof (lastname) !== "string") ? user.lastname : lastname;

                // Save the modified user
                user.save().then(
                    result => res.send({success: true}),
                    err => res.status(500).send({success: false, reason: "DB update failed."})
                );
            },
            err => res.status(500).send({success: false, reason: err}))
    })

    // Delete user
    .delete(function (req, res, next) {

        let username = sanitize(req.params.username);

        // Prevent deleting someone else's account.
        if (req.session.username != username)
            return res.status(403).send({success: false, reason: "You cannot delete another user."});

        // Delete all user sessions, user entry, and chordsheets
        MongoClient.connect("mongodb://localhost:27017/chordpro", function (err, db) {
            if (err)
                return res.status(500).send({success: false, reason: err});

            db.collection('mySessions')
                .remove(
                    {session: {user: {username: username}}},
                    {w: 1},
                    function (err, result) {
                        if (err)
                            return res.status(500).send({success: false, reason: err});

                        // Get user, and delete.
                        // Also delete user chordsheets
                        getUserInfo(username, false, true).remove().then(
                            () => {
                                ChordSheet.find({owner: username}).remove().then(
                                    () => {

                                        // Destroy session
                                        req.session.destroy();

                                        // Tell user success
                                        res.send({success: true});
                                    },
                                    err => res.status(500).send({success: false, reason: err})
                                );
                            },
                            err => res.status(500).send({success: false, reason: err})
                        );
                    });
        });
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
let getUserInfo = function (username, addpass, returnQueryObj) {
    let selectStmt = (addpass) ? "username firstname lastname password" : "username firstname lastname";

    let query = User.find({username: username})
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



/** Validates email and returns true if the email is in a valid format.
 *
 * @param emailAddress  The email to validate.
 * @returns {boolean}
 */
let validateEmail = function(emailAddress) {
    return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(emailAddress);
};

module.exports.router = router;
