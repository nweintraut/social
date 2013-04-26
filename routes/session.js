var Account = require('../models/account');
module.exports = function(app){
    app.get('/account/authenticated', function(req, res, next){
       if (req.session.loggedIn) {
           res.send(200);
       } else {
           res.send(401);
       }
    });
    app.get('/register', function(req, res, next){
        var firstName = req.param('firstName', '');
        var lastName = req.param('lastName', '');
        var email = req.param('email', null);
        var password = req.param('password', null);
        console.log( firstName + "] [" + lastName + "] [" + email + "] [" + "] [" + password);
        if(null === email || null === password) {
            return res.send(400);
        } else {
            // Account.register(email, firstName, lastName);
            res.send(200);
        }
    });
    app.post('/login', function(req, res, next){
        console.log('login request');
        var email = req.param('email', null);
        var password = req.param('password', null);
        if (null === email || email.length < 1 || null === password || password.length < 1) {
            return res.send(400);
        } else {
            Account.login(email, password, function(success){
               if (!success) {
                   console.log('login was *not* successful');
                   return res.send(401);
               } else {
                   console.log('login was successful');
                   res.send(200);
               }
            });
        }
    });
};