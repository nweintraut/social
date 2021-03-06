var async   = require('async');
var Account = require('../models/account');
var Contact = require('../models/contact');
var Friend = require('../models/friend');
var Status = require('../models/status');

module.exports = function(app){
    var models = {"Account": [
            {email: "a@mail.com", name: {first: "A", last: "Alast"}, password: "p"},
            {email: "b@mail.com", name: {first: "B", last: "Blast"}, password: "p"},
            {email: "c@mail.com", name: {first: "C", last: "Clast"}, password: "p"},
            {email: "d@mail.com", name: {first: "D", last: "Dlast"}, password: "p"},
            {email: "e@mail.com", name: {first: "E", last: "Elast"}, password: "p"},
            {email: "f@mail.com", name: {first: "F", last: "Flast"}, password: "p"},
            {email: "g@mail.com", name: {first: "G", last: "Glast"}, password: "p"},
            {email: "h@mail.com", name: {first: "H", last: "Hlast"}, password: "p"} 
        ]
    };

    function identifyModel(modelString){
        if(modelString === null) {return null;}
        var model = null;
        var Models = [Account, Contact, Friend, Status];
        for (var i=0; i < Models.length; i++){
            var name = Models[i].modelName;
            if(name === modelString) {
                model = Models[i];
                break;
            }
        }
        return model;
    }
    function createFriends(me, friend, callback){
        console.log("in createFriends");
        (function(me1, friend1, callback1){
            Account.find({email: me.email}, function(err, docs, count){
                console.log("Count is: ["  + count + "]");
                if(err) {return callback1(err, docs);}
                else if (!docs || !Array.isArray(docs) || docs.length === 0) {
                    return callback1(err, null);
                }
                else {
                    if(docs.length > 2){ return callback1(new Error("More than one Account"), docs);}
                    var doc = docs[0];
                    console.log("Doc: " + doc);
                    Account.find({email: friend.email}, function(err, docs, count){
                        if(err) {return callback1(err, docs);}
                        else if (!docs || !Array.isArray(docs) || docs.length === 0) {return callback1(err, null);}
                        else {
                            var friendDoc = docs[0];
                            console.log("Friend doc: " + friendDoc);
                            Account.addFriend(doc.id, friendDoc.id, callback1);
                        }
                    });
                }
            });
        })(me, friend, callback);
    }
    app.get('/db/cf/:index', function(req, res, next){
        console.log("in /db/cf/:index");       
    });
    app.get('/db/createfriend', function(req, res, next){
        console.log("in /db/createfriend");
       var me =  {email: "a@mail.com", name: {first: "A", last: "Alast"}, password: "p"};
       var friend = {email: "b@mail.com", name: {first: "E", last: "Flast"}, password: "p"};
       createFriends(me, friend, function(err, result){
          if(err) {return res.send(err.message);}
          else {
              
              var output = "<html><head><title>Made a friend</title></head><body>"
              + "<p>me:     " + JSON.stringify(result.me) + "</p>"
              + "<p> friend:  "    + JSON.stringify(result.friend) + "</p>"
              + "<p> friendShip: " + JSON.stringify(result.friendShip) + "</p>"
              + "<p> contact:    " + JSON.stringify(result.contact) + "</p></body></html>";
              
              return res.send(output);
          }
       });
    });
    function createDocuments(model, amount, callback){
        console.log("Creating models");
        var params = models[model.modelName];
        model.create(params, function(err){
            var models = [];
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    console.log(arguments[i]);
                    models.push(arguments[i]);
               }  
            }
            if(err){return callback(err, null);}
            else {
                return callback(null, models);
            }
        });
    }
    function createStatus(amount, callback){
        Account.find({}, function(err, accounts){
            if (err) {return callback(err, accounts);}
            else {
                accounts.forEach(function(account) {
                    if (account.status === null) { account.status = [];}
                   var email = account.email;
                   for (var i=0; i < amount; i++) {
                       console.log("Email: [" + email + "] [" + i + "]");
                       var status = new Status({status: email + " status " + i, owner: account});
                       console.log ("Status is: " + Status);
                       account.status.push(status);
                   }
                   account.save(function(err, account){
                       return callback(err, account);
                   });
                });
            }
        });
    }
    app.get('/db/createstatus', function(req, res, next){
        createStatus(5, function(err, accounts){
           if(err) {return res.send(err.message);}
           else { res.send(JSON.stringify(accounts));}
        });
    }); 
    
    function listAccounts(req, res, next) {
       Account.find({}, function(err, results){
          if(err) {return res.send(err.message );}
          else {
              return res.render('db/list', {title: "Accounts", accounts: results});
          }
        });        
    }
    app.post('/db/account/friend', function(req, res, next){
        console.log(req.body);
        var friender0 = req.param('friender', null);
        var friend0 = req.param('friend', null);
        if (!friender0 || !friend0) {return listAccounts(req, res, next);}
        var frienders = [];
        var friends = [];
        (!Array.isArray(friender0)) ? frienders.push(friender0) : frienders = friender0;
        (!Array.isArray(friend0))   ? friends.push(friend0)   : friends = friend0;
        var docArray = [];
        var date = new Date();
        frienders.forEach(function(friender){
            friends.forEach(function(friend){
                docArray.push({friender: friender, friend: friend, added: date, updated: date});
            });           
        });
        var options = [{path:'friender', select: "email _id name"}, {path: 'friend', select: 'email _id name'}];
        Friend.create(docArray, function(err){
            if (err) {return res.send(err.message);}
            else {
                var models = [];
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        console.log(arguments[i]);
                        models.push(arguments[i]);
                   }  
                }
                Friend.populate(models, options, function(err, results) {
                    if(err) {return res.send(404);}
                    else {
                        res.render('db/friends4', {title: "Friends", friends: results});
                    }
                });

            }
        });  
    });
    
    app.get('/db/create/:model/:amount', function(req,res, next){
        var amount = req.params.amount ? req.params.amount : 1;
        var modelString = req.params.model ? req.params.model : null;
        var model = identifyModel(modelString);
        createDocuments(model, amount, function(err, models){
            var output = "";
            if(err){return res.send(err.message);}
            else{
                models.forEach(function(model){
                    output += JSON.stringify(model);
                });
                res.render('index', {title: "Accounts", accounts: models});
                // res.send(output);
            }
        });
    });
    app.get('/db/friends', function(req, res, next){
        Friend.find({})
        .populate({path:'friender', select: "email _id name"})
        .populate({path: 'friend', select: 'email _id name'}).exec(function(err, results){
            if(err) {return res.send(err.message);}
            else {
                return res.render('db/friends4', {title: "Friends", friends: results});
            }
        });
    });
    app.get('/db/accounts', function(req, res, next){
       Account.find({}, function(err, results){
          if(err) {return res.send(err.message );}
          else {
              // console.log(results);
              return res.render('db/list', {title: "Accounts", accounts: results});
          }
       });
    });
    app.get('/db/status', function (req, res, next) {
       Status.find({}, function(err, statuses){
          if(err){return res.send(err.message);}
          else{ return res.send(JSON.stringify(statuses));}
       });
    });
    app.get('/db/deleteall/:model', function(req, res, next){
        var modelString = req.params.model ? req.params.model : null;
        var model = null;
        var Models = [Account, Contact, Friend];
        for (var i=0; i < Models.length; i++){
            var name = Models[i].modelName;
            if(name === modelString) {
                model = Models[i];
                break;
            }
        }
        if(model){
            deleteAllDocuments(model, function(err){
                if(err){return res.send(err.message);}
                else{return res.send(200);}
            });            
        } else {
            res.send(modelString + " did not match any models");
        }
    });
    function deleteAllDocuments(model, callback) {
        console.log("Deleting " + model.modelName);
        model.find({}, function(err, docs){
            function done(err, results){  
                var errors = null;
                results.forEach(function(result){
                    if (result) {
                        console.log(result);
                        if(errors === null) {errors = 1;}
                        else {errors += 1;}
                    }
                });
                callback(errors);
            }
            if (err) {return callback(err);}
            else if (!docs || !Array.isArray(docs) || docs.length === 0) {  
                return(callback(new Error("In deleteAllDocuments(), no " + model.modelName + " documents found to delete")));
            }
            else {
                var asyncArray = [];
                docs.forEach(function(doc){
                    (function(doc1){
                        asyncArray.push(function (next){doc1.remove(next);});
                    })(doc);
                    console.log("Queued doc: [" + doc.id + "]");
                });
                async.parallel(asyncArray, done);
/*
                docs.forEach(function(account){
                    console.log(account);
                    account.remove(function(err, anything){
                      if(err){return callback(err);}  
                      else{
                          console.log("Removed: [" + account.id + "] [" + account.email + "] [" + account.password + "]");
                          return callback(err);
                      }
                    });
                });
                */
            }
        });      
    }
};