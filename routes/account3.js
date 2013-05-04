var Account = require('../models/account');
var Friend  = require('../models/friend');
var Status  = require('../models/status');
module.exports = function(app){
    
    app.get('/accounts/:id/contacts', function(req, res, next){
        if (! req.params.id || req.params.id === "") {return res.send(401);}        
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;        
        Friend.find({friender: accountId})
            .populate({path:'friender', select:"email _id name"})
            .populate({path:'friend', select: "email _id name"})
            .exec(function(err, results){
               if(err){return res.send(400);}
               else {
                   if(req.is('html')) {
                       return res.render('account/friends', {title: "Friends", friends: results});                       
                   } else {
                       return res.send(JSON.stringify(results));
                   }
               }
            });
    });
    app.get('/accounts/:id/activity', function(req, res, next){
        if (! req.params.id || req.params.id === "") {return res.send(401);}
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Account.findById(accountId)
        .exec(function(err, account){
           if(err) {console.log("DB error in account/:id/activity " + err.message);}
           if(req.is('html')) {
               return res.send(account.activity);
           } else {

               if (!account.activity) {account.activity = [];}
             console.log("[" + account.activity + "]");
               return res.send(account.activity);
           }
        });
    });
    app.get('/accounts/:id/status', function(req, res, next){
        if (! req.params.id || req.params.id === "") {return res.send(401);}
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Account.findById(accountId, function(err, account){
           if(err) {console.log("DB error in account/:id/status " + err.message);}
           if(req.is('html')) {
               return res.send(account.status);
           } else {
               return res.send(account.status);
           }
        });
    });
    app.post('/accounts/:id/status', function(req, res, next){
        if (! req.params.id || req.params.id === "") {return res.send(401);}
        if (! req.param('status') || req.param('status') === ""){ return res.send(401);}
        var status = req.param('status');
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Account.findById(accountId, function(err, account) {
           if (err) {return res.send(err.message);}
           else {
               status = new Status({owner: account, status: status});
               if (!account.status) {account.status = [];}
               account.status.push(status);
               if(!account.activity) {account.activity = [];}
               account.activity.push(status);
               account.save(function(err, doc){
                   if (err) {console.log(err.message);}
                   return res.send(200);
               });
           }
        });
    });
    app.delete('/accounts/:id/contact', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;  
        var friendId = req.param('contactId') ? req.param('contactId') : null;
        if (friendId === null) {return res.send(400);}
        else {
            Friend.findOneAndRemove({friender: accountId, friend: friendId}, function(err, formerFriendship){
                if(err) { return res.send(400);}
                else {
                    res.send(200);
                }
            });
        }
    });
    app.post('/accounts/:id/contact', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;  
        if (!accountId || accountId === "") {return res.send(400);}
        var friendId = req.param('contactId') ? req.param('contactId') : null;
        if (friendId === null) {return res.send(400);}
        var conditions = {friender: accountId, friend: friendId};
        var update = {};
        var options = {upsert: false};
        Friend.findOrCreate(conditions, update, options, function(err, friend, created){
            var error = "";
            if(err) { return res.send(401, error.message);}
            else {return res.send(200);}
        });       
    });
    app.get('/accounts/:id', function(req, res, next){
        console.log("in /accounts/:id");
        var me = req.params.id === 'me';
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        console.log ("account id = [" + accountId + "]");
        if (!accountId || accountId === "") {return res.send(400, "No id");}
        Account.findById(accountId)
        .exec(function(err, account){
            var error = "";
            if(err){
                error = err.message;
                return res.send(401, error);
            } else if(req.params.id === "me") {
                account.isFriend = true;
                console.log ("In /accounts/:id \n" + account);
                return res.send(JSON.stringify(account));
            } else {
                Friend.find({friender: req.session.accountId, friend:accountId}, function(err, friend){
                   if (err) { return res.send(401, err.message); } 
                   account.isFriend = false;
                   if (friend) { account.isFriend = true; } 
                   return res.send(JSON.stringify(account));
                });
            }
        });
    });
    app.post('/contacts/find', function(req, res, next){
       var searchStr = req.param('searchStr', null);
       if (null === searchStr) { return res.send(404);}
       else {
           Account.findByString(searchStr, function onSearchDone(err, accounts) {
               if(err || accounts.length === 0){ return res.send(404); }
               else { return res.send(JSON.stringify(accounts));}
           });
       }
    });
    app.get('/accounts', function(req, res, next){
        Account.find({})
        .exec(function(err, results){
            if(err) {return res.send(err.message);}
            else {return res.render('db/list', {title: "Accounts", accounts: results});}
        });
    });
    app.get('/accounts/:id/patchcontact', function(req, res, next){
        Account.find({email: "e@mail.com"}, function(err, accounts){
           if (err){return res.send(err.message);}
           else {
               var account = accounts[0];
               var contact = {name: {first: "Neil", last: "Weintraut"}};
               // return res.send(JSON.stringify(account));
               if (!account.contacts){ account.contacts =[];}
               account.contacts.push(contact);
               account.save(function(err, result){
                   if (err) {return res.send(err.message);}
                   else {return res.send(JSON.stringify(result));}
               });
           }
        });
    });
};