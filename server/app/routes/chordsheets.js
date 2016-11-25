/**
 * Created by darryl on 2016-11-24.
 */

// ---- REQUIRES ---- //
var express     = require('express');
var router      = express.Router({ mergeParams: true });

// Setup db models
var ChordSheet  = require('./../models/chordsheet-model');

// ---- ROUTES ---- //

// Get all chordsheets
router.get('/', function(req, res, next) {
    res.sendStatus(404);
});

module.exports = router;
