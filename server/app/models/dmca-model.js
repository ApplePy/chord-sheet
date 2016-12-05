"use strict";
/**
 * Created by darryl on 2016-12-04.
 */


// ---- REQUIRES ---- //

let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;


// ---- SETUP ---- //

let DmcaSchema   = new Schema({
    claimant: String,
    originalWork: String,
    iSongTitle: String,
    iOwner: String,
    contactInfo: String,
    disputes: {type: [String], default: []},
    active: {type: Boolean, default: true}
});


// ---- EXPORTS ---- //

module.exports = mongoose.model('Dmca', DmcaSchema);