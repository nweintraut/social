var mongoose = require('mongoose');
require('./mongodb_connection');
var nodemailer = require('nodemailer'); // NEIL this is probably wrong
var Contact = require ('./contact');
var ContactSchema = Contact.schema;


    var crypto = require("crypto");
    var StatusSchema = new mongoose.Schema({
        name: {
            first:  {type: String },
            last:   {type: String }
        },
        status:     {type: String }
    });
    
    var AccountSchema = new mongoose.Schema({
        email:      { type: String, unique: true},
        password:   {type: String },
        name: {
            first:  {type: String },
            last:   {type: String }
        },
        birthday: {
            day:    {type: Number, min: 1, max: 31, required: false},
            month:  {type: Number, min: 1, max: 12, required: false},
            year:   {type: Number, min: 1900, required: false}
        },
        photoUrl:   {type: String },
        biography:  {type: String },
        contacts:   [ContactSchema],
        status:     [StatusSchema],
        activity:   [StatusSchema]
    });
    
   
    var registerCallback = function(err){
        if(err) {return console.log(err);}
        else { return console.log("Account was created"); }
    };
    function hashPassword(password){
      var shaSum = crypto.createHash('sha256');
      shaSum.update(password);
      var hashedPassword = shaSum.digest('hex'); 
      return hashedPassword;
    }
    AccountSchema.methods.hashPassword = hashPassword;
    
    
    AccountSchema.statics.addContact = function(myId, contactId, callback){
        (function(myId1, contactId1, callback1){
            Account.findById(myId1, function(err, me, count){
               if(err){return callback(err, me, count);} 
               else {
                   Account.findById(contactId1, function(err, friend, count){
                       if(err){return callback1(err, friend, count);}
                       else {
                           var date = new Date();
                           var contact = new Contact({
                               name: friend.name,
                               accountId: friend._id,
                               added: date,
                               updated: date});
                           me.contacts.push(contact);
                           me.save(function(err, friender, count){
                               if(err){return callback1(err, friender, count);}
                               else {
                                   contact.name = friender.name;
                                   contact.accountId = friender._id;
                                   friend.contacts.push(contact);
                                   friend.save(callback1(err, friend, count));
                               }
                           });
                       }
                   });
               }
            });
        })(myId, contactId, callback);
    };
    AccountSchema.methods.addFriends = function(friendId, callback){
        (function(account, friendId1, callback1){
            Account.findById(friendId1, function(err, friend){
                if (err){return callback1(err);}
                else {
                    var date = new Date();
                    var friendContact = new Contact({accountId: friend.id, added: date, updated: date});
                    console.log(friend);
                    account.contacts.push(friendContact);
                    account.save(function(err, result, count){
                        if (err) {return callback1(err);}
                        else {
                            console.log("Added friend");
                            var date = friendContact.added;
                            var meAsContact = new Contact({accountId: account.id, added: date, updated: date});
                            console.log(".........\n" + meAsContact);

                            friend.contacts.push(meAsContact);
                            friend.save(function(err, result, count){
                                console.log(friend + "\n.........");
                                if(!err){console.log("Added me as friend");}
                               return callback1(err); 
                            });
                        }
                    });                    
                }
            });
        })(this, friendId, callback);
    };
    AccountSchema.static('changePassword', function(accountId, newpassword){
      var hashedPassword = hashPassword(newpassword);
      Account.update({_id:accountId}, {$set: {password: hashedPassword}}, {upsert: false}, 
                function changePasswordCallback(err){
                    if(err) {console.log("Error with change password " + err);}
                    else {console.log('Change password done for account ' + accountId);}
                });
    });
    AccountSchema.static('forgotPassword',function(email, resetPasswordUrl, callback){
        Account.findOne({email: email}, function findAccount(err, doc){
            if(err){ callback(false);}
            else {
                var smtpTransport = nodemailer.createTransport('SMTP', {}); // Neil need to fill in config hash
                resetPasswordUrl += '?account=' + doc._id;
                smtpTransport.sendMail({
                    from:       'thisapp@example.com',
                    to:         doc.email,
                    subject:    'SocialNet Password Request',
                    text:       'Click here to reset your password: ' + resetPasswordUrl
                }, function forgotPasswordResult(err){
                    if(err) {callback(false);}
                    else {callback(true);}
                });
            }
        });
    });
    AccountSchema.static('login', function(email, password, callback){
        console.log("In login" + email + "] [" + password);    
      var hashedPassword = hashPassword(password);  

      Account.findOne({email:email, password: hashedPassword}, function(err, doc){
          if (err){console.log("***** Mongo Error " + err);}
          callback(doc);
      });
    });
    AccountSchema.static('register', function(email, password, firstName, lastName){
      var hashedPassword = hashPassword(password);
        console.log('Registering ' + email);
        var user = new Account({email: email, name: {first: firstName, last: lastName}, 
                                password: hashedPassword});
        user.save(registerCallback);
        console.log("Save command was sent");
    });
    AccountSchema.pre('save', function(next){
        var password = this.password;
        if (password) {
            this.password = this.hashPassword(password);
        }
        next();
    });
var Account = mongoose.model('Account', AccountSchema);
module.exports = Account;