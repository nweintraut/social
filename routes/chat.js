var Account = require('../models/account');
var Friend = require('../models/friend');
var Contact = require('../models/contact');
module.exports = function(server, app){
    var io = require('socket.io');
    var utils = require('connect').utils;
    var cookie = require('cookie');
    var Session = require('connect').middleware.session.Session;
    
    var sio = io.listen(server);
    
    sio.configure(function(){
        app.isAccountOnline = function(accountId){
            var clients = sio.sockets.clients(accountId);
            return(clients.length > 0);
        };
        Contact.schema.app2 = app;
        sio.set('authorization', function(handshakeData, accept){
            if(!handshakeData.headers.cookie) {
                return accept('No cookie', false);
            }
            console.log("In sio authorization");
            var signedCookies = cookie.parse(handshakeData.headers.cookie);
            var cookies = utils.parseSignedCookies(signedCookies, app.sessionSecret);
            handshakeData.sessionID = cookies['express.sid'];
            handshakeData.sessionStore = app.sessionStore;
            handshakeData.sessionStore.get(handshakeData.sessionID, function(err, session){
                if(err || !session) {
                    return accept('Invalid session', false);
                } else {
                    handshakeData.session = new Session(handshakeData, session);
                    accept(null, true);
                }
            });
        });
        sio.sockets.on('connection', function(socket){
           var session = socket.handshake.session;
           var accountId = session.accountId;
           var Friends = null;
           socket.join(accountId);
           app.triggerEvent('event:' + accountId, {from: accountId, action: 'login'});
           var handleContactEvent = function(eventMessage) {
               socket.emit('contactEvent', eventMessage);
           };
           var subscribeToAccount = function(accountId) {
             var eventName = 'event:' + accountId;
             app.addEventListener(eventName, handleContactEvent);
             console.log("Subscribing to: " + eventName);
           };
           Friend.find({friender: accountId}, function subscribeToFriendFees(err, friends){
               if(err){console.log(err.message);}
               else {
                   var subscribedAccounts = {};
                   Friends = friends;
                   friends.forEach(function(friend){
                       if(!subscribedAccounts[friend.friend]){
                           subscribeToAccount(friend.friend);
                           subscribedAccounts[friend.friend] = true;
                           console.log("Added " + friend.friend + " to subscribed accounts");
                       }
                   });
                   if(!subscribedAccounts[accountId]){subscribeToAccount(accountId)}
               }
           });
           /*
           Account.findById(accountId, function subscribeToFriendFees(account){
               var subscribedAccounts = {};
               sAccount = account;
               account.contacts.forEach(function(contact){
                  if(!subscribedAccounts(contact.accountId)){
                      subscribeToAccount(contact.accountId);
                      subscribedAccounts[contact.accountId] = true;
                  } 
               });
               if(!subscribedAccounts[accountId]){subscribeToAccount(accountId)}
           });
           */
           socket.on('disconnect', function(){
               Friends.forEach(function(friend){
                   var eventName = "event:" + friend.friend;
                   app.removeEventListener(eventName, handleContactEvent);
                   console.log('Unsubscribing from' + eventName);
               });
               /*
              sAccount.contacts.forEach(function(contact){
                 var eventName = 'event:' + contact.accountId;
                 app.removeEventListener(eventName, handleContactEvent);
                 console.log('Unsubscribing from '+ eventName);
              });
              */
              app.triggerEvent('event:' + accountId, {from: accountId, actions: 'logout'});
           });
           socket.on('chatclient', function(data){
               sio.sockets.in(data.to).emit('chatserver', { from: accountId, text: data.text});
           });
        });
    });
};