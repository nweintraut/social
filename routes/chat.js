module.exports = function(server, app){
    var io = require('socket.io');
    var utils = require('connect').utils;
    var cookie = require('cookie');
    var Session = require('connect').middleware.session.Session;
    
    var sio = io.listen(server);
    
    sio.configure(function(){
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
           socket.join(accountId);
           socket.on('chatclient', function(data){
               sio.sockets.in(data.io).emit('chatserver', { from: accountId, text: data.text});
           });
        });
    });
};