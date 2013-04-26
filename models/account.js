var mongoose = require('mongoose');
require('./mongodb_connection');
var nodemailer = require('nodemailer'); // NEIL this is probably wrong


    var crypto = require("crypto");
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
        biography:  {type: String }
    });
    

    
    var registerCallback = function(err){
        if(err) {return console.log(err);}
        else { return console.log("Account was created"); }
    };
    AccountSchema.static('changePassword', function(accountId, newpassword){
      var shaSum = crypto.createHash('sha256');
      shaSum.update(newpassword);
      var hashedPassword = shaSum.digest('hex');
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
      var shaSum = crypto.createHash('sha256');
      shaSum.update(password);
      Account.findOne({email:email, password: shaSum.digest('hex')}, function(err, doc){
          callback(null !== doc);
      });
    });
    AccountSchema.static('register', function(email, password, firstName, lastName){
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);
        console.log('Registering ' + email);
        var user = new Account({email: email, name: {first: firstName, last: lastName}, 
                                password: shaSum.digest('hex')});
        user.save(registerCallback);
        console.log("Save command was sent");
    });
var Account = mongoose.model('Account', AccountSchema);
module.exports = Account;