"use strict";
/**
 * Created by darryl on 2016-11-23.
 */

// ---- REQUIRES ---- //

// Handling the chord_api
let express     = require('express');
let router      = express.Router({ mergeParams: true });
let bcrypt      = require('bcrypt');
let mongoose    = require('mongoose');


// ---- EXPORTS ---- //

/** Sets up sanitize function that will be used by sub-routers (MUST occur before setup)
 *
 * @param str           The string to be sanitized
 * @returns {string}    The sanitized string
 */
module.exports.sanitize = function (str) {
    // htmlEscape Source: http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
    if (typeof str != "string") return str;
    return str
        .replace(/&(?![A-Za-z0-9#]{2,4};)/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\//g, '&#x2F;');
};


// ---- SETUP ---- //

// Setup mongo connection
mongoose.Promise        = Promise;     // Just use JavaScript promises.
module.exports.mongoose = mongoose.connect('mongodb://localhost:27017/chordpro'); // connect to our database

// Import sub-routers
let user_api    = require('./routes/users').router;
let chord_api   = require('./routes/chordsheets');

// Set up no-caching middleware
router.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

// Wire up sub-routers
router.use('/users', user_api);
router.use('/chordsheets', chord_api);


// Catch-all
router.use(function(req, res, next) {
    res.sendStatus(501);
});

module.exports.router = router;
