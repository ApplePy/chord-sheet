/**
 * Created by darryl on 2016-11-24.
 */

// ---- REQUIRES ---- //
var express         = require('express');
var router          = express.Router({ mergeParams: true });
var getTokenOwner   = require('./users').getTokenOwner;

// Setup db models
var ChordSheet  = require('./../models/chordsheet-model');

// ---- ROUTES ---- //

router.route('/')
    // Get all chordsheets
    .get(function(req, res, next) {
        var token = req.cookies.token;

        if (token) {
            getTokenOwner(token)
                .then(function (user) {
                    // Find chord sheets that the user owns or are public.
                    ChordSheet.aggregate([
                        {
                            $match: {$or: [{'owner': user.username}, {'private': false}]}
                        },
                        {
                            $group: {_id: {owner: "$owner", songtitle: "$songtitle"}, latestRevision: {$max: "$revision"}}
                        }
                    ], function (err, result) {if (!err) res.send(result); else res.status(500).send(err);});

                }, function (err) {
                    res.status(500).send(err.message);
                });
        } else {
            // Find public chord sheets
            ChordSheet.aggregate([
                {
                    $match: {private: false}
                },
                {
                    $group: {_id: {owner: "$owner", songtitle: "$songtitle"}, latestRevision: {"$max": "$revision"}}
                }
            ], function (err, result) {if (!err) res.send(result); else res.status(500).send(err);});

        }
    })

    // Create new chordsheet/upload revision
    .post(function(req, res, next) {
        res.sendStatus(501);
    })

    // Delete chordsheet and all revisions.
    .delete(function(req, res, next) {
        res.sendStatus(501);
    });

module.exports = router;
