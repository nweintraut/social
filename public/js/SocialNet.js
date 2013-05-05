define(['router', 'SocialNetSockets'], function(router, socket){
    var initialize = function(){
        socket.initialize(router.socketEvents);
        checkLogin(runApplication);
    };
    var checkLogin = function(callback) {
      $.ajax('/account/authenticated', {
         method: "GET",
         success: function(){
             return callback(true);
         },
         error: function(data) {
             return callback(false);
         }
      });  
    };
    var runApplication = function(authenticated) {
        if(!authenticated) {
            window.location.hash = 'login';
        } else {
            router.socketEvents.trigger('app:loggedin');
            window.location.hash = 'index';
        }
        Backbone.history.start();
    };
    return {
        initialize: initialize
    };
});