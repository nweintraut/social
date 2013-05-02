var Account     = require('../models/account');
var Friend      = require('../models/friend');
module.exports = function(app){
    app.get('/listaccounts', function(req, res, next){
       Account.find({}, function(err, accounts){
           var error = null;
         if(err){
             error = err.message;
         }
         return res.render('account/list', {title: "Accounts", accounts: accounts, error: error});
       });
    });
    app.get('/account/new', function(req, res, next){
        var error = "";
        var account = {name:{first: "", last: ""}, email: "", password: "", id: ""};
        res.render('account/new', {title: "Create Account", account: account, error: error});
    });
    app.get('/account/:id', function(req, res, next){
        var id = req.params.id ? req.params.id : "";
        if (id === ""){
            return res.redirect('/listaccounts');
        }
        else {
            Account.findById(id, function(err, account){
                var error = "";
                if(err){error = err.message;}
                else {
                    return res.render('account/new', {title: "Account Detail", account: account, error: error});
                }
            });
        }
    });
    function prepareUpdate(req){
        var conditions = {
            email: req.param('email') ? req.param('email')     : ""
        };
        var update = {
            name : {
                first: req.param('firstName') ? req.param('firstName') : "",
                last:  req.param('lastName')  ? req.param('lastName')  : "",
            },
            password:  req.param('password')  ? req.param('password')  : ""
        };
        if (update.password === "") {delete update.password;}     
        return {conditions: conditions, update: update};
    }
    app.post('/account', function(req, res, next){
        var dbData = prepareUpdate(req);
        var options = {upsert: true};
        Account.findOrCreate(dbData.conditions, dbData.update, options, function(err, account, created){
            var error = "";
            if(err) {
                error = error.message;    
            }
            return res.render('account/new', {title: "Account", account: account, error: error});
        });
    });
    app.put('/account/:id', function(req, res, next){
        var id = req.param("id") ? req.param("id") : "";
        var error = null;
        if (id === "") {
            error = "No ID";
            var account = {name:{first: "", last: ""}, email: "", password: "", id: ""};
            res.render('account/new', {title: "Account", account: account, error: error});
        }
        var dbData = prepareUpdate(req);
        var options = {upsert: false, new: true};
        Account.findByIdAndUpdate(id, dbData.update, options, function(err, account){
            var error = "";
            if (err) {
                error = err.message;
            }
            return res.render('account/new', {title: "Account", account: account, error: error});
        });
    });
    app.delete('/account/:id', function(req, res, next){
        var id = req.param("id") ? req.param("id") : "";
        var error = null;
        if (id === "") {
            error = "No ID";
            return res.redirect('/listaccounts');
        } else {
            Friend.remove({friender: id}, function(err){
                if (err) {
                    return res.redirect('back');
                } else {
                    Friend.remove({friend: id}, function(err){
                       if(err) { return res.redirect('back');}
                       else {
                        Account.findByIdAndRemove(id, {}, function(err, removedAccount){
                            var error = "";
                            if (err) {
                                error = err.message;
                            }
                            else {
                                res.redirect('/listaccounts');
                            }
                        });                           
                       }
                    });
                }
            });

        }      
    });
};