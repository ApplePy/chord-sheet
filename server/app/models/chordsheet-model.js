/**
 * Created by darryl on 2016-11-24.
 */

var mongoose        = require('mongoose');
var autoIncrement   = require('mongoose-auto-increment');
var connection      = require('../chord_api').mongoose;
var Schema          = mongoose.Schema;

// Increment initialization
autoIncrement.initialize(connection);


var ChordSheetSchema = new Schema({
    songtitle: String,
    private: Boolean,
    owner: {type: Schema.Types.ObjectId, ref: 'User'}
});


ChordSheetSchema.plugin(autoIncrement.plugin, {model: 'ChordSheet', field: 'revision'});
module.exports = mongoose.model('ChordSheet', ChordSheetSchema);
