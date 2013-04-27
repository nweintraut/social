var Account = require('../models/account');
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
    app.get('/accounts/:id', function(req, res, next){
        var accountId = req.params.id === 'me' ? req.session.accountId : req.params.id;
        Account.findById(accountId, function(err, account){
            if (err) {console.log("Error from Mongdo db find account " + err + accountId);}
            res.send(account);
        });
    });
};