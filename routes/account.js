var Account = require('../models/account');
var Friend = require('../models/friend');
module.exports = function(app){

    app.get('/accounts/:id/status', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Account.findById(accountId, function(err, account){
            if(err){console.log("Mongo DB Error " + err);}
            res.send(account.status);    
        });
    });
    app.post('/accounts/:id/status', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Account.findById(accountId, function(err, account){
            var status = {name: account.name, status: req.param('status', '')};
            account.status.push(status);
            // Push the status to all friends
            account.activity.push(status);
            account.save(function(err){
                if (err) {
                    console.log('Error saving account: ' + err);
                }
            });
        });
        res.send(200);
    });
    app.get('/accounts/:id/activity', function(req, res, next) {
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        console.log("Id is: " + accountId );
        Account.findById(accountId, function(err, account){
            console.log("Err is: [" + err);
            console.log("Account is: \n" + account);
            res.send(account.activity);
        });
    });   
    app.delete('/accounts/:id/contact', function(req, res, next){

        var contactId = req.param('contactId', null);
        if(null === contactId) {return res.send(400);}
        else {
            Account.findById(accountId, function(err, account){
                if (!account) {return res.send(401);}
                Account.removeContact(account, contactId, function(err, account){
                    res.send(200);
                });
            });
        }
    });
    app.get('/accounts/:id/contacts', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Friend.find.or({friender: accountId}, {friend: accountId}, function(err, docs, counnt){
           if(err) {return res.send(400);}
           else {
               
           }
        });
    });
    app.post('/accounts/:id/contact', function(req, res, next) {
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        var contactId = req.param('contactId', null);
        if(null === contactId) {return res.send(400);}
        else {
            Account.findById(accountId, function(err, account){
                if (!account) {return res.send(401);}
                Account.findById(contactId, function(err, contact){
                    if(err) {return res.send(401); }
                    else {
                        Account.addContact(account, contact, function(err, account){
                            if (err) {return res.send(401);}
                            else {
                                Account.addContact(contact, account, function(err, contact){
                                    if (err) {return res.send(401);}
                                    else {
                                        res.send(200);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
    app.get('/accounts/:id', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Account.findById(accountId, function(err, account){
            if (err) {console.log("Error from Mongdo db find account " + err + accountId);}
            res.send(account);
        });
    });
    app.post('/contacts/find', function(req, res, next) {
        var searchStr = req.param('searchStr', null);
        if(null === searchStr) {
            return res.send(400);
        } else {
            Account.findByString(searchStr, function onSearchDone(err, accounts){
               if (err || accounts.length === 0) {
                   res.send(404);
               } else {
                   res.send(accounts);
               }
            });
        }
    })
};