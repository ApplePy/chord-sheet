"use strict";
/**
 * Created by darryl on 2016-12-04.
 */

let express     = require('express');
let router      = express.Router({ mergeParams: true });
let sanitize    = require('../chord_api').sanitize;

// Setup db models
let Dmca        = require('../models/dmca-model');



router.route('/')

    /** Get all DMCA notices */
    .get(function(req, res, next) {

        // Administrative use only
        if (!req.session.loggedin || !req.session.user.admin)
            return res.status(401).send({success: false, reason: "Unauthorized."});

        Dmca.find({}).then(
            results => res.send(results),
            err => res.status(500).send({success: false, reason: err})
        );
    })


    /** Upload new DMCA complaint */
    .post(function(req, res, next) {
        // Complaint people don't need to sign in, so don't validate login status.

        // Sanitize all inputs
        let claimant        = sanitize(req.body.claimant);
        let originalWork    = sanitize(req.body.originalWork);
        let iSongTitle      = sanitize(req.body.iSongTitle);
        let iOwner          = sanitize(req.body.iOwner);
        let contactInfo     = sanitize(req.body.contactInfo);

        // Ensure all data is there
        if (typeof (originalWork) !== "string" || originalWork.length === 0 ||
            typeof (iSongTitle) !== "string" || iSongTitle.length === 0 ||
            typeof (iOwner) !== "string" || iOwner.length === 0 ||
            typeof (contactInfo) !== "string" || contactInfo.length === 0 ||
            typeof (claimant) !== "string" || claimant.length == 0)
            return res.status(400).send({success: false, reason: "Missing or invalid parameter."});


        let complain            = new Dmca();
        complain.claimant       = claimant;
        complain.originalWork   = originalWork;
        complain.iSongTitle     = iSongTitle;
        complain.iOwner         = iOwner;
        complain.contactInfo    = contactInfo;


        complain.save().then(
            results => res.send({success: true, id: results._id}),
            err => res.status(500).send({success: false, reason: err})
        );
    });


router.route('/:id/dispute')

    /** Get specific DMCA dispute */
    .get(function(req, res, next) {

        // Get id
        let id = sanitize(req.params.id);

        res.redirect('../' + id);     // Your princess is in another castle!
    })


    /** File dispute with DMCA claim */
    .post(function(req, res, next) {
        // Get id
        let id          = sanitize(req.params.id);
        let disputeText = sanitize(req.body.dispute);

        // Check that all data is there
        if (typeof(disputeText) !== "string" || disputeText.length <= 0)
            return res.status(400).send({success: false, reason: "Dispute text missing or invalid."});

        // Save data
        Dmca.findByIdAndUpdate(id, {$push: {disputes: disputeText}}).then(
            results => {
                if (results == null)
                    return res.status(404).send({success: false, reason: "No matching ID found."});

                return res.send({success: true});
            }, err => res.status(500).send({success: false, reason: err})
        )

    });


router.route('/:id')

    /** Get a specific DMCA complaint */
    .get(function(req, res, next) {
        // Administrative use only
        if (!req.session.loggedin || !req.session.user.admin)
            return res.status(401).send({success: false, reason: "Unauthorized."});

        // Get id
        let id = sanitize(req.params.id);

        // Find and return id
        Dmca.findById(id).then(
            results => res.send(results),
            err => res.status(404).send({success: false, reason: "No matching ID found."})
        );
    })


    /** Mark a DMCA complaint as inactive */
    .delete(function (req, res, next) {

        // Administrative use only
        if (!req.session.loggedin || !req.session.user.admin)
            return res.status(401).send({success: false, reason: "Unauthorized."});

        // Get ID of DMCA claim
        let id = sanitize(req.params.id);

        // Mark the claim as inactive.
        Dmca.findByIdAndUpdate(id, {$set: {active: false}}).then(
            results => res.send({success: true}),
            err => res.status(404).send({success: false, reason: "No matching ID found."})
        );
});



module.exports = router;