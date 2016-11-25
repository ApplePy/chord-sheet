/**
 * Created by darryl on 2016-11-23.
 */

// Handling the chord_api
var express     = require('express');
var router      = express.Router({ mergeParams: true });
var bcrypt      = require('bcrypt');
var mongoose    = require('mongoose');

// Setup mongo connection
module.exports.mongoose = mongoose.connect('mongodb://localhost:27017/chordpro'); // connect to our database

// Import sub-routers
var user_api    = require('./routes/users').router;
var chord_api   = require('./routes/chordsheets');

// Wire up sub-routers
router.use('/users', user_api);
router.use('/chordsheets', chord_api);


// Catch-all
router.use(function(req, res, next) {
    res.sendStatus(501);
});

// Sanitize inputs
// htmlEscape Source: http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
module.exports.sanitize = function (str) {
    return str
        .replace(/&/g, '&amp;')     // TODO: this function is not idempotent because of this line. Fix.
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\//g, '&#x2F;');
};

module.exports.router = router;
