define(['SocialNetView', 'text!templates/login.html'], function(SocialNetView, loginTemplate){
    var loginView = SocialNetView.extend({
        requireLogin: false,
        
        el: $('#content'),
        events: {
            'submit #loginForm': "login"
        },
        initialize: function(options){
          this.socketEvents = options.socketEvents;  
        },
        login: function(){
            var socketEvents = this.socketEvents; // capture in a local variable that is carried with the closure.
            $.post('/login', 
/*           {
                email: $('input[name=email]').val(),
                password: $('input[name=password]').val()
            }, 
*/               
            this.$('#loginForm').serialize(),            
            function(data){
                socketEvents.trigger('app:loggedin');
                window.location.hash ='index';
            }).error(function(){
                $('#error').text("Unable to login.");
                $('#error').slideDown();
            });
            return false;
        },
        render: function(){
            this.$el.html(loginTemplate);
            $('#error').hide();
            $('input[name=email]').focus();
        }
    });
    return loginView;
});
