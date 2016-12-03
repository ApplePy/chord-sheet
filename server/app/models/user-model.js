"use strict";
/**
 * Created by darryl on 2016-11-24.
 */


// ---- REQUIRES ---- //

let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;


// ---- SETUP ---- //

let UserSchema   = new Schema({
    username: {type: String, unique: true},
    firstname: String,
    lastname: String,
    password: String,
    admin: {type: Boolean, default: false}
});


// ---- EXPORTS ---- //

module.exports = mongoose.model('User', UserSchema);