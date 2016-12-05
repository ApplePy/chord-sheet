"use strict";
/**
 * Created by darryl on 2016-11-24.
 */


// ---- REQUIRES ---- //

let mongoose        = require('mongoose');
let autoIncrement   = require('mongoose-auto-increment');
let connection      = require('../chord_api').mongoose;
let Schema          = mongoose.Schema;


// ---- SETUP ---- //

// Increment initialization
autoIncrement.initialize(connection);

let ChordSheetSchema = new Schema({
    songtitle: String,
    private: Boolean,
    owner: String,
    contents: String,
    infringing: {type: Boolean, default: false},
    date: {type: Date, default: Date.now}
});

ChordSheetSchema.plugin(autoIncrement.plugin, {model: 'ChordSheet', field: 'revision'});


// ---- EXPORTS ---- //

module.exports = mongoose.model('ChordSheet', ChordSheetSchema);
