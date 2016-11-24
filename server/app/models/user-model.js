/**
 * Created by darryl on 2016-11-24.
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    username: {type: String, unique: true},
    firstname: String,
    lastname: String,
    password: String
});

module.exports = mongoose.model('User', UserSchema);