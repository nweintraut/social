process.env.TZ = "America/Los_Angeles";
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , MemoryStore = require('connect').session.MemoryStore;


require('./models/account');
var app = express();

app.sessionStore = new MemoryStore();
app.configure(function(){
  app.sessionSecret = 'SocialNet secret key';
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
      key: 'express.sid',
      secret: app.sessionSecret,
      maxAge: 3600000,
      store: app.sessionStore
  })); 
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes/db')(app);
require('./routes/session')(app);
require('./routes/account3')(app);
require('./routes/account2')(app);

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

require('./routes/chat')(server, app);
require('./appEvents')(app);
/*
var Account = require('./models/account');
var Friend = require('./models/friend');
var account = new Account({email: "a@mail.com", name: {first: "A", last: "Alast"}, password: "p"});
function testAccount(){
account.save(function(err){
    if (err){console.log(err.message);}
    else {
    var friend = new Account({email: "friend@mail.com", name: {first: "Friend", last: "Alast"}, password: "p"});
    friend.save(function(err){
        if (err) {console.log(err.message);}
        Friend.createFriendship(account.id, friend.id, function(err, friendship){
           if (err) {
               deleteAccounts();
               return console.log(err);
           }
           else {
               console.log("Friendship1: " + friendship);               
               Friend.findFrienship(friendship.friender, friendship.friend, function(err, docs, count){
                   if(err) {return console.log(err);}
                   else {
                       console.log("Found frienship: " + docs + "] [" + count + "]");
                       */
                       /*
                       Friend.deleteFriendship(friendship.friender, friendship.friend, function(err){
                           console.log("Deleting friendship: [" + friendship.friender + "] [" + friendship.friend + "]");
                           if (err) {return console.log(err);}
                           
                       });
                       deleteAccounts();
                       */
                       /*
                   }
               });
           }
        });
    });
    }
});
}

// testAccount();
// deleteAccounts();
function deleteAccounts() {
        Account.find({}, function(err, results){
            if (err) {console.log("Error MongoDB " + err);}
            if (!results) {console.log("no Accounts found");}
            else {
                results.forEach(function(account){
                    console.log(account);
                    Account.remove({_id: account.id}, function(){
                      if(err){return console.log(err);}  
                      else{console.log("Removed: [" + account.email + "] [" + account.password + "]");}
                    });
                    
                });
            }
        });      
}
*/
