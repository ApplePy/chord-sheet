/**
 * Created by darryl on 2016-11-24.
 */

var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;


var UserCookieSchema= new Schema({
    token: {type: Number, unique: true},
    owner: String,
    createdAt: {type: Date, expires: 24 * 60 * 60, default: Date.now}  // To expire the cookie automatically at 24hrs.
});


module.exports = mongoose.model('UserCookie', UserCookieSchema);
