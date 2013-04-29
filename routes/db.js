var async   = require('async');
var Account = require('../models/account');
var Contact = require('../models/contact');
var Friend = require('../models/friend');

module.exports = function(app){
    
    function identifyModel(modelString){
        if(modelString === null) {return null;}
        var model = null;
        var Models = [Account, Contact, Friend];
        for (var i=0; i < Models.length; i++){
            var name = Models[i].modelName;
            if(name === modelString) {
                model = Models[i];
                break;
            }
        }
        return model;
    }
    function createDocuments(model, amount, callback){
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
                res.send(output);
            }
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
        console.log("Deleting accounts");
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