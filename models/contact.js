var mongoose = require('mongoose');
require('./mongodb_connection');


var ContactSchema = new mongoose.Schema({
    accountId:  {type: mongoose.Schema.ObjectId, ref: "Account" },    
    name: {
        first:  {type: String},
        last:   {type: String}
    },
    added:      {type: Date, default: new Date()},
    updated:    {type: Date, default: new Date()}
});
var Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;