
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

require('./models/account');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('my secret string'));
  app.use(express.session({
      secret: 'my secret string',
      maxAge: 3600000
  })); 
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes/session')(app);
app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
/*
var Account = require('./models/account');
Account.find({}, function(err, results){
    if (err) {console.log("Error MongoDB " + err);}
    if (!results) {console.log("no Accounts found");}
    else {
        results.forEach(function(account){
            Account.remove({_id: account.id}, function(){});
           console.log("[" + account.email + "] [" + account.password + "]"); 
        });
    }
});
*/