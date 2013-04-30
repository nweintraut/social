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
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        var friendId = req.param('contactId', null);
        if(null === friendId) {return res.send(400);}
        else {
            Friend.findOneAndRemove({friender: accountId, friend: friendId}, function(err, friendship){
                if(err) {
                    console.log(err.message);
                    return res.send(400);
                }
                else {
                    console.log("Removed friendship " + friendship);
                    if (req.is('json')) {
                        return res.send(200);
                    } else {
                        return res.redirect("back");
                    }
                }
            });
        }
    });
    app.get('/accounts/:id/contacts', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Friend.find({friender: accountId})
            .populate({path:'friender', select:"email _id name"})
            .populate({path:'friend', select: "email _id name"})
            .exec(function(err, results){
               if(err){return res.send(400);}
               else {
                   if(req.is('json')) {
                       res.send(JSON.stringify(results));
                   } else {
                       return res.render('db/friends4', {title: "Friends", friends: results});
                   }
               }
            });
    });


    app.post('/accounts/:id/contact', function(req, res, next) {
        var frienderId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        var friendId = req.param('contactId', null);
        if(null=== frienderId || null === frienderId) {return res.send(400);}
        else {
            var date = new Date();
            var conditions = {friender: frienderId, friend: friendId};
            var update = {friender: frienderId, friend: friendId, added: date, updated: date};
            var options = {upsert: true};
            Friend.findOrCreate(conditions, update, options, function(err, friend, created){
               if (err) { return res.send(401);}
               else {
                   if(req.is('json')) {return res.send(200);}
                   else res.redirect('/db/friends');
               }
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