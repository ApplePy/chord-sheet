/**
 * Created by darryl on 2016-11-24.
 */


// ---- REQUIRES ---- //

let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;


// ---- SETUP ---- //

let UserCookieSchema= new Schema({
    token: {type: Number, unique: true},
    owner: String,
    createdAt: {type: Date, expires: 24 * 60 * 60, default: Date.now}  // To expire the cookie automatically at 24hrs.
});


module.exports = mongoose.model('UserCookie', UserCookieSchema);
