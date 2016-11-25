/**
 * Created by darryl on 2016-11-24.
 */

// ---- REQUIRES ---- //
var express         = require('express');
var router          = express.Router({ mergeParams: true });
var getTokenOwner   = require('./users').getTokenOwner;
var sanitize        = require('../chord_api').sanitize;

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
                            $group: {
                                _id: {owner: "$owner", songtitle: "$songtitle"},
                                latestRevision: {$max: "$revision"},
                                revisionCount: {$sum: 1}
                            }
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
        var token = req.cookies.token;

        // Chordsheets can't be made if you're not logged in.
        if (!token) res.status(401).send({success: false, reason: "Unauthorized"});
        else {
            getTokenOwner(token).then(
                function(user) {
                    if (!req.body.songtitle || req.body.private === undefined || !req.body.string) {
                        res.status(400).send({success: false, reason: "Missing mandatory parameter."});
                        return;
                    }

                    // Create new sheet and populate with data
                    var sheet       = new ChordSheet();
                    sheet.songtitle = sanitize(req.body.songtitle);
                    sheet.private   = Boolean(req.body.private);
                    sheet.owner     = sanitize(user.username);
                    sheet.contents  = sanitize(req.body.contents);     // TODO: Validate user chordsheet

                    // Save sheet
                    sheet.save(function(err, save){
                        if (!err) res.send({success: true});
                        else res.status(500).send({success: false, reason: err});
                    });
                },
                function(err) {
                    res.status(401).send({success: false, reason: "Invalid or expired token."});
                });
        }
    })

    // Delete chordsheet and all revisions.
    .delete(function(req, res, next) {
        res.sendStatus(501);
    });

module.exports = router;
