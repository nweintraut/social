var mongoose = require('mongoose');
require('./mongodb_connection');


var ContactSchema = new mongoose.Schema({
    accountId:  {type: mongoose.Schema.ObjectId },    
//    accountId:  {type: mongoose.Schema.ObjectId },
    name: {
        first:  {type: String},
        last:   {type: String}
    },
    added:      {type: Date},
    updated:    {type: Date}
});
var Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;