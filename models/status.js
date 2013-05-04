var mongoose = require('mongoose');
require('./mongodb_connection');
var Schema = mongoose.Schema;

var StatusSchema = new mongoose.Schema({
    owner:      {type: Schema.Types.ObjectId, ref: "Account"},
    status:     {type: String },
    created:    {type: Date, default: new Date()}
});

var Status = mongoose.model('Status', StatusSchema);
module.exports = Status;