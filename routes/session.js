var Account = require('../models/account');
module.exports = function(app){
    app.get('/account/authenticated', function(req, res, next){
       if (req.session.loggedIn) { 
           res.send(200);
       } else {
           res.send(401);
       }
    });
    app.post('/register', function(req, res, next){
        var firstName = req.param('firstName', '');
        var lastName = req.param('lastName', '');
        var email = req.param('email', null);
        var password = req.param('password', null);
        console.log( "First[" + firstName + "] Last[" + lastName + "] Email[" + email + "] Password[" + password +"]");
        if(null === email || null === password) {
            return res.send(400);
        } else {
            Account.register(email, password, firstName, lastName);
            res.send(200);
        }
    });
    app.post('/login', function(req, res, next){
        var email = req.param('email', null);
        var password = req.param('password', null);
        if (null === email || email.length < 1 || null === password || password.length < 1) {
            return res.send(400);
        } else {
            console.log("Email: [" + email + "] Password [" + password + "]");
            Account.login(email, password, function(account){
               if (!account) {
                   console.log('login was *not* successful');
                   return res.send(401);
               } else {
                   console.log('login was successful');
                   req.session.loggedIn = true;
                   req.session.accountId = account._id;
                   res.send(200);
               }
            });
        }
    });
    app.get('/resetPassword', function(req, res, next){
        var accountId = req.param('account', null);
        res.render('resetPassword', {locals:{accountId: accountId}});
    });
    app.post('/resetPassword', function(req, res, next){
        var accountId = req.param('accountId', null);
        var password = req.param('password', null);
        if (null !== accountId && null !== password){
            Account.changePassword(accountId, password);
            res.render('resetPasswordSuccess');
        } else {
            res.render('index');
        }
    });
};