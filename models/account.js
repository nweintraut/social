var mongoose = require('mongoose');
require('./mongodb_connection');
var nodemailer = require('nodemailer'); // NEIL this is probably wrong
var Schema = mongoose.Schema;
var Contact = require ('./contact');
var Status  = require('./status');
var StatusSchema = Status.schema;
var ContactSchema = Contact.schema;
var Friend = require('./friend');
var findOrCreate = require('./find_or_create_plugin');
var async = require('async');


    var crypto = require("crypto");
    /*
    var StatusSchema = new mongoose.Schema({
        owner:      {type: Schema.Types.ObjectId, ref: "Account"},
        status:     {type: String }
    });
    */
    var AccountSchema = new mongoose.Schema({
        email:      {type: String, unique: true},
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
        activity:   [StatusSchema],
        friends:    [{type: Schema.Types.ObjectId, ref: "Account", index: true }], // People that I made a friend
        frienders:  [{type: Schema.Types.ObjectId, ref: "Account", index: true }], // People that friended me       
    });
    
   AccountSchema.plugin(findOrCreate);
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
    
    
    AccountSchema.statics.addFriend = function(myId, friendId, callback){
      (function(myId1, friendId1, callback1){
          Account.findById(myId1, function(err, me){
              if(err) { return callback1(err, null);}
              else {
                  console.log("Me is..." + me);
                  Account.findById(friendId1, function(err, friend){
                      if(err) {return callback1(err, null);}
                      else {
                          if(! me.friends) me.friends = [];
                          me.friends.push(friend);
                          me.save(function(err, myAccount){
                              if(!friend.frienders) friend.frienders = [];
                              friend.frienders.push(me);
                              friend.save(function(err, friendAccount){
                                  var date = new Date();    
                                  Friend.create({friender: myAccount, friend: friend, added: date, updated: date}, 
                                    function(err, friendShip){
                                        console.log("Friendship is: " + friendShip);
                                        if(err){return callback1(err, null);}
                                        else {
                                            var contact = {name: friendAccount.name, id: friendAccount.id,
                                                added: friendShip.added, updated: friendShip.updated};       
                                            return callback(null, {me: myAccount, friend:friendAccount, friendShip: friendShip, contact: contact});
                                        }
                                    });
                              });

                          });
                      }
                  });
              }
          });
      })(myId, friendId, callback);  
    };
    AccountSchema.statics.addContact = function(myId, contactId, callback){
        (function(myId1, contactId1, callback1){
            Account.findById(myId1, function(err, me, count){
               if(err){return callback1(err, me, count);} 
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
    AccountSchema.statics.addFriend2 = function(me0, friend0, callback0){
        (function(me, friend, callback){
            function done(err, results){
                if(err){return callback(err, null);}
                else {
                    console.log("\n[" + results[0] + "]\n[" + results[1] + "]\n[" + results[2] +"]\n");                    
                    if (results[0]) {
                        return callback(null, results[0]);
//                        return callback(new Error("friendShip already exists"), results[0]);
                    }
                    else if (!results[1] && !results[2]){
                        return callback(new Error("One or both IDs invalid"), null);
                    } else {
                        var date = new Date();
                        return Friend.create({friender: me, friend: friend, added: date, updated: date} , callback);
                    }
                }
            }
            var asyncArray = [];
            asyncArray.push(function(next){Friend.findOne({friender: me, friend: friend}, next)});
            asyncArray.push(function(next){Account.findById(me, next)});
            asyncArray.push(function(next){Account.findById(friend, next)});
            async.parallel(asyncArray, done);
        })(me0, friend0, callback0);
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
    AccountSchema.statics.findByString = function(searchStr, callback) {
        var searchRegex = new RegExp(searchStr, "i");
        Account.find()
        .or({'name.full': {$regex: searchRegex}}, {email: {$regex: searchRegex}}).exec(callback); 
    };
    AccountSchema.virtual('name.full').get(function(){
        return this.name.first + " " + this.name.last;
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