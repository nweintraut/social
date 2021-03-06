var Account = require('../models/account');
module.exports = function(app){
    app.get('/account/authenticated', function(req, res, next){
       if (req.session.loggedIn) { return res.send(req.session.accoundId);} 
       else { return res.send(401);}
    });
    app.post('/register', function(req, res, next){
        var firstName = req.param('firstName', '');
        var lastName = req.param('lastName', '');
        var email = req.param('email', null);
        var password = req.param('password', null);
        console.log( "First[" + firstName + "] Last[" + lastName + "] Email[" + email + "] Password[" + password +"]");

            Account.register(email, password, firstName, lastName, function(err, account){
                if(err) {return res.send(404);}
                else {
                    console.log("Registered: " + account);
                    return res.send(200); }
            });

    });
    app.post('/login', function(req, res, next){
        var email = req.param('email', null);
        var password = req.param('password', null);
        if (null === email || email.length < 1 || null === password || password.length < 1) {
            return res.send(400);
        } else {
            console.log("Email: [" + email + "] Password [" + password + "]");
            Account.login(email, password, function(err, account){
                if (err){ return res.send(400);}
               if (!account) {
                   console.log('login was *not* successful');
                   return res.send(401);
               } else {
                   console.log('login was successful');
                   req.session.loggedIn = true;
                   req.session.accountId = account._id;
                   return res.send(account._id);
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
            res.render('resetPasswordSuccess');
        }
    });
    app.post('/forgotpassword', function(req, res, next){
       var hostname = req.headers.host;
       var resetPasswordUrl = "http://" + hostname + '/resetPassword';
       var email = req.params('email', null);
       if (null === email || email.length < 1) {
           return res.send(404);
       }
       else {
           Account.forgotPassword(email, resetPasswordUrl, function(success){
              if (success){ return res.send(200);}
              else { return res.send(404);}
           });
       }
    });
};