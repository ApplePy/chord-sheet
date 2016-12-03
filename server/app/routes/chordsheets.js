"use strict";
/**
 * Created by darryl on 2016-11-24.
 */

// ---- REQUIRES ---- //

let express         = require('express');
let router          = express.Router({ mergeParams: true });
let sanitize        = require('../chord_api').sanitize;
let ChordproValid   = require('../models/chordpro-validation/chordpro-validator.service');

// Setup db models
let ChordSheet      = require('./../models/chordsheet-model');


// ---- HELPERS ---- //

/** Constructs the data and returns results to client.
 *
 *  Returns a {metadata: [], results: []} object on success, error string otherwise.
 */
let matchFuncBase = function (req, res, next) {
    return function (matchParam) {
        // Find chord sheet stats
        ChordSheet.aggregate([
            {$match: matchParam},
            {
                $group: {
                    _id: {owner: "$owner", songtitle: "$songtitle"},
                    latestRevision: {$max: "$revision"},
                    revisionCount: {$sum: 1},
                }
            }
        ]).then(stats => {
            // Find chord sheets
            ChordSheet.aggregate([{$match: matchParam}, {$sort: {date: -1}}])
                .then(
                    // Send stats and results
                    results => res.send({metadata: stats, results: results}),
                    // Send error
                    err => res.status(500).send(err));
        }, err => res.status(500).send(err));
    }
};


// ---- ROUTES ---- //

router.route('/')

    /** Get all chordsheets */
    .get(function(req, res, next) {

        let loggedin = req.session.loggedin;
        let user = req.session.user;
        let matchFunc = matchFuncBase(req,res,next);

        // Change behaviour if the user is logged in or not
        if (loggedin)
            // Find chord sheets that the user owns or are public, along with stats
            matchFunc({$or: [{'owner': user.username}, {'private': false}]});

        // Find public chord sheets
        else
            matchFunc({private: false});
    })


    /** Create new chordsheet/upload revision. */
    .post(function(req, res, next) {
        let loggedin = req.session.loggedin;
        let user = req.session.user;

        // Chordsheets can't be made if you're not logged in.
        if (!loggedin)
            return res.status(401).send({success: false, reason: "Unauthorized."});


        // ---- POST-VALIDATION CALLBACKS ---- //

        /** Save the posted sheet. */
        let save = () => {

            // ---- CREATE AND SAVE SHEET ---- //

            // Create new sheet and populate with data
            let sheet       = new ChordSheet();
            sheet.songtitle = sanitize(req.body.songtitle);
            sheet.private   = Boolean(req.body.private);
            sheet.owner     = sanitize(user.username);
            sheet.contents  = sanitize(req.body.contents);


            // Save sheet callback
            sheet.save().then(
                result => res.send({success: true}),
                err => res.status(500).send({success: false, reason: err})
            );
        };

        /** Save the posted sheet, and update other sheets if critical control data has changed. */
        let updateAndSave = () => {

            // Check if this is an update that updates control data, and update other docs in the set
            if (typeof (req.body.oldversion) === "object" && (
                    sanitize(req.body.oldversion.songtitle) != sanitize(req.body.songtitle) ||
                    Boolean(req.body.oldversion.private) != Boolean(req.body.private)
                )) {

                // Construct find and replace objects
                let findObject = {
                    owner: user.username,
                    songtitle: sanitize(req.body.oldversion.songtitle),
                    private: Boolean(req.body.oldversion.songtitle)
                };
                let updateObject = {
                    songtitle: sanitize(req.body.songtitle),
                    private: Boolean(req.body.songtitle)
                };

                // Update objects
                ChordSheet.update(findObject, updateObject, {multi: true}).then(
                    result => save(),
                    err => res.status(500).send({success: false, reason: err})
                );
            } else save();
        };


        // ---- VALIDATE INPUT ---- //

        // Ensure that all necessary data exists
        if (!req.body.songtitle || typeof (req.body.private) != "boolean" || !req.body.contents)
            return res.status(400).send({success: false, reason: "Missing mandatory parameter."});

        // Validate user chordsheet
        let validator = new ChordproValid.ChordproValidatorService();
        let results = validator.validate(sanitize(req.body.contents));

        // Stop if errors found
        if (results.containsErrors())
            return res.status(400).send({
                success: false,
                reason: "Invalid ChordPro format.",
                errors: results.errors,
                warnings: results.warnings
            });

        // Verify that an exact copy of the old version isn't being saved,
        if (typeof (req.body.oldversion) === "object") {

            // Check to make sure all the sub-objects are there (owner doesn't matter, ownership isn't changing.
            if (typeof (req.body.oldversion.songtitle) !== "string" ||
                typeof (req.body.oldversion.private) !== "boolean" ||
                typeof (req.body.oldversion.contents) !== "string")
                return res.status(400).send({success: false, reason: "Missing parameter from oldversion."});

            // If the contents are the exact same, don't save
            if (req.body.oldversion.songtitle === req.body.songtitle &&
                req.body.oldversion.private === req.body.private &&
                req.body.oldversion.contents === req.body.contents)
                return res.send({success: true, reason: "No change detected. Not saving."});

            // Make sure they are not updating the songtitle to one that they already have
            if (sanitize(req.body.oldversion.songtitle) != sanitize(req.body.songtitle)) {
                return ChordSheet.findOne({owner: user.username, songtitle: sanitize(req.body.songtitle)}).then(
                    result => {
                        // If something was found, reject
                        if (result.length != 0)
                            return res.status(409).send({
                                success: false,
                                reason: "Songtitle already in use."
                            });

                        // Data is good, start saving
                        updateAndSave();
                    },
                    err => res.status(500).send(err)
                );
            }
        }

        // Save the posted sheet
        updateAndSave();
    });



router.route('/:songtitle')

    /** Get a single collection of chordsheets. */
    .get(function(req, res, next) {
        let matchFunc = matchFuncBase(req,res,next);    // Specialize matchFuncBase
        let songtitle = sanitize(req.params.songtitle);
        let loggedin = req.session.loggedin;
        let user = req.session.user;

        // Change behaviour if the user is logged in or not
        if (loggedin)
            // Find chord sheets that the user owns or are public, along with stats
            matchFunc({songtitle: songtitle, $or: [{'owner': user.username}, {'private': false}]});

        // Find public chord sheets
        else matchFunc({songtitle: songtitle, private: false});
    })


    /** Delete a chordsheet and all revisions. */
    .delete(function(req, res, next) {
        let songtitle = sanitize(req.params.songtitle);
        let loggedin = req.session.loggedin;
        let user = req.session.user;

        // Chordsheets can't be made if you're not logged in.
        if (!loggedin)
            return res.status(401).send({success: false, reason: "Unauthorized."});

        // Delete matching songs
        ChordSheet
            .find({owner: sanitize(user.username), songtitle: sanitize(songtitle)})
            .remove()
            .then(
                result => {
                    // If items were deleted
                    if (result.result.n > 0)
                        res.send({success: true});
                    else
                        res.send({success: false, reason: "Chordsheet not found or does not belong to you."});
                },
                err => res.status(500).send({success: false, reason: err})
            );
    });



router.route('/:songtitle/:username')

    /** Get a single chordsheet from a single user. */
    .get(function(req, res, next) {
        let matchFunc = matchFuncBase(req,res,next);    // Specialize matchFuncBase
        let username = sanitize(req.params.username);
        let songtitle = sanitize(req.params.songtitle);
        let loggedin = req.session.loggedin;
        let user = req.session.user;

        // Change behaviour if the user is logged in or not
        if (loggedin)
            // Find chord sheets that the user owns or are public, along with stats
            matchFunc({
                owner: username,
                songtitle: songtitle,
                $or: [{'owner': user.username}, {'private': false}]
            });

        // Find public chord sheets
        else matchFunc({owner: username, songtitle: songtitle, private: false});
    });


// ---- EXPORTS ---- //
module.exports = router;
