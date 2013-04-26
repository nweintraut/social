define(['text!templates/forgotpassword.html'], function(forgotpasswordTemplate){
    var forgotpasswordView = Backbone.View.extend({
       el: $('#content'),
       events: {'submit form': "password" },
       password: function(){
           $.post('/forgotpassword', {
               email: $('input[name=emai]').val()
           }, function(data){
              console.log(data); 
           });
           return false;
       },
       render: function(){
           this.$el.html(forgotpasswordTemplate);
       }
    });
    return forgotpasswordView;
});