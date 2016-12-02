/**
 * Created by darryl on 2016-11-24.
 */

// ---- REQUIRES ---- //

let express         = require('express');
let router          = express.Router({ mergeParams: true });
let getTokenOwner   = require('./users').getTokenOwner;
let sanitize        = require('../chord_api').sanitize;
let ChordproValid   = require('../models/chordpro-validation/chordpro-validator.service');
let Validator       = require('validatorjs');

// Setup db models
let ChordSheet  = require('./../models/chordsheet-model');


// ---- HELPERS ---- //

/** Consutructs the data and returns results to client. */
let matchFuncBase = function (req, res, next) {
    return function (matchParam) {
        // Find chord sheet stats
        ChordSheet.aggregate([
            {
                $match: matchParam
            },
            {
                $group: {
                    _id: {owner: "$owner", songtitle: "$songtitle"},
                    latestRevision: {$max: "$revision"},
                    revisionCount: {$sum: 1},
                }
            }
        ]).then(stats => {
            // Find chord sheets
            ChordSheet.aggregate([{$match: matchParam}]).then(
                // Send stats and results
                results => res.send({metadata: stats, results: results}),
                err => res.status(500).send(err));
        }, err => res.status(500).send(err));
    }
};


// ---- ROUTES ---- //

// TODO: Downloading the entire chordsheet database sounds like a *BAD* idea. Limit/pagination/some caching???

router.route('/')
    // Get all chordsheets
    .get(function(req, res, next) {

        let token = req.signedCookies.token;
        let matchFunc = matchFuncBase(req,res,next);

        // Change behaviour if the user is logged in or not
        if (token) {
            getTokenOwner(token)
                .then(
                    // Find chord sheets that the user owns or are public, along with stats
                    user => matchFunc({$or: [{'owner': user.username}, {'private': false}]}),
                    err => res.status(500).send(err.message)
                );
        } else {
            // Find public chord sheets
            matchFunc({private: false});
        }
    })

    // Create new chordsheet/upload revision
    .post(function(req, res, next) {
        let token = req.signedCookies.token;

        // Chordsheets can't be made if you're not logged in.
        if (!token) {
            res.status(401).send({success: false, reason: "Unauthorized"});
            return;
        }

        // Get requesting user info
        getTokenOwner(token).then(
            function(user) {
                // Ensure that all necessary data exists
                if (!req.body.songtitle || typeof (req.body.private) != "boolean" || !req.body.contents) {
                    res.status(400).send({success: false, reason: "Missing mandatory parameter."});
                    return;
                }

                // Create new sheet and populate with data
                let sheet       = new ChordSheet();
                sheet.songtitle = sanitize(req.body.songtitle);
                sheet.private   = Boolean(req.body.private);
                sheet.owner     = sanitize(user.username);
                sheet.contents  = sanitize(req.body.contents);

                // Validate user chordsheet
                let validator = new ChordproValid.ChordproValidatorService();
                let results = validator.validate(sheet.contents);

                // Stop if errors found
                if (results.containsErrors()) {
                    res.status(400).send({success: false,
                        reason: "Invalid ChordPro format.",
                        errors: results.errors,
                        warnings: results.warnings
                    });
                    return;
                }

                // Save sheet
                // NOTE: Don't worry about duplicates. User could change text, then change back.
                let save = () => {
                    sheet.save(function(err, save){
                        if (!err) res.send({success: true});
                        else res.status(500).send({success: false, reason: err});
                    })};

                // TODO: This entire post is UGLY. Fix.

                let checkDuplicate = nextFunc => {
                    ChordSheet.findOne({owner: user.username, songtitle: sanitize(req.body.songtitle)}, function(err, result) {

                        // Check for errors and songs that already exist under that name
                        if (err) return res.status(500).send(err);
                        if (result && result.length != 0) return res.status(409).send({success: false, reason: "Songtitle already in use"});

                        // Trigger next function
                        nextFunc();
                    });
                };


                // Check if this is an update, and update other docs in the set otherwise
                // TODO: Break out updates to its own API POST?
                if (typeof (req.body.oldSongtitle) == "string" || typeof (req.body.oldPrivate) == "boolean") {
                    let findObject = {owner: user.username};
                    let updateObject = {};

                    // If the letiable exists and differs from the new value, mark add to list of fields to update
                    if (typeof (req.body.oldSongtitle) == "string" && sanitize(req.body.oldSongtitle) != sanitize(req.body.songtitle)) {
                        findObject.songtitle = sanitize(req.body.oldSongtitle);
                        updateObject.songtitle = sanitize(req.body.songtitle);
                    }
                    if (typeof (req.body.oldPrivate) == "boolean" && req.body.oldPrivate != req.body.private) {
                        findObject.private = req.body.oldPrivate;
                        updateObject.private = req.body.private;
                    }

                    // Update objects
                    let updateAndSave = () => {
                        ChordSheet.update(findObject, updateObject, { multi: true }, function(err, raw) {
                            if (err) return res.status(500).send({success: false, reason: err});

                            save();
                        })
                    };

                    // Make sure user isn't trying to change the name to a songtitle that already exists in their uploads
                    if (sanitize(req.body.oldSongtitle) != sanitize(req.body.songtitle)) {
                        ChordSheet.findOne({owner: user.username, songtitle: sanitize(req.body.songtitle)}, function(err, result) {

                            // Check for errors and songs that already exist under that name
                            if (err) return res.status(500).send(err);
                            if (result && result.length != 0) return res.status(409).send({success: false, reason: "Songtitle already in use"});

                            // Check for duplicate, and updateAndSave on success
                            checkDuplicate(updateAndSave);
                        });
                    } else updateAndSave();
                } else checkDuplicate(save);
            },
            err => res.status(401).send({success: false, reason: "Invalid or expired token."})
        );
    });

router.route('/:songtitle')
    // Get a single collection of chordsheets.
    .get(function(req, res, next) {
        let songtitle = sanitize(req.params.songtitle);
        let token = req.signedCookies.token;
        let matchFunc = matchFuncBase(req,res,next);

        // Change behaviour if the user is logged in or not
        if (token) {
            getTokenOwner(token)
                .then(
                    // Find chord sheets that the user owns or are public, along with stats
                    user => matchFunc({songtitle: songtitle, $or: [{'owner': user.username}, {'private': false}]}),
                    err => res.status(500).send(err.message)
                );
        } else {
            // Find public chord sheets
            matchFunc({songtitle: songtitle, private: false});
        }
    })

    // Delete a chordsheet and all revisions.
    .delete(function(req, res, next) {
        let songtitle = sanitize(req.params.songtitle);
        let token = req.signedCookies.token;

        // Chordsheets can't be made if you're not logged in.
        if (!token) {
            res.status(401).send({success: false, reason: "Unauthorized"});
            return;
        }

        // Get requesting user info
        getTokenOwner(token).then(
            function(user) {
                // Delete matching songs
                ChordSheet
                    .find({owner: sanitize(user.username), songtitle: sanitize(songtitle)})
                    .remove()
                    .exec(function(err, result) {
                        // Tell user success
                        if (!err && result.result.n > 0)
                            res.send({success: true});
                        else if (!err && result.result.n == 0)
                            res.send({success: false, reason: "Chordsheet " + sanitize(songtitle) + " not found or does not belong to you."});
                        else
                            res.status(500).send({success: false, reason: err.message});
                    });
            },
            err => res.status(401).send({success: false, reason: "Invalid or expired token."})
        );
    });

router.route('/:songtitle/:username')
    //Get a single chordsheet from a single user
    .get(function(req, res, next) {
        let username = sanitize(req.params.username);
        let songtitle = sanitize(req.params.songtitle);
        let token = req.signedCookies.token;
        let matchFunc = matchFuncBase(req,res,next);

        // Change behaviour if the user is logged in or not
        if (token) {
            getTokenOwner(token)
                .then(
                    // Find chord sheets that the user owns or are public, along with stats
                    user => matchFunc({owner: username, songtitle: songtitle, $or: [{'owner': user.username}, {'private': false}]}),
                    err => res.status(500).send(err.message)
                );
        } else {
            // Find public chord sheets
            matchFunc({owner: username, songtitle: songtitle, private: false});
        }
    });

module.exports = router;
