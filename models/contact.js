var mongoose = require('mongoose');
require('./mongodb_connection');

var schemaOptions = {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
};

var ContactSchema = new mongoose.Schema({
    accountId:  {type: mongoose.Schema.ObjectId, ref: "Account" },    
    name: {
        first:  {type: String},
        last:   {type: String}
    },
    added:      {type: Date, default: new Date()},
    updated:    {type: Date, default: new Date()}
}, schemaOptions);

ContactSchema.virtual('online').get(function(){
    var app = ContactSchema.app2;
   return app.isAccountOnline(this.get('accountId')); 
});
var Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;