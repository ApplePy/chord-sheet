/**
 * Created by darryl on 2016-11-23.
 */

// Handling the chord_api
var express     = require('express');
var router      = express.Router({ mergeParams: true });
var bcrypt      = require('bcrypt');
var mongoose    = require('mongoose');

// Setup mongo connection
mongoose.connect('mongodb://localhost:27017/chordpro'); // connect to our database

// Import sub-routers
var user_api    = require('./users');

// Wire up sub-routers
router.use('/users', user_api);



router.get('/', function(req, res, next) {
    res.send('Got a GET request for the api');
});

router.post('/', function(req, res, next) {
    res.send('Got a POST request for the api');
});


router.delete('/', function(req, res, next) {
    res.send('Got a DELETE request for the api');
});


module.exports = router;
