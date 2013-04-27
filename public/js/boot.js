require.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
     jQuery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
     Underscore: 'libs/underscore',
     Backbone: 'libs/backbone',
     text: 'libs/text',
     templates: '../templates',
     SocialNetView: 'SocialNetView'
    },
    shim: {
        'Backbone': ['Underscore', 'jQuery'],
        'SocialNet': ['Backbone']
    }
});
require(['SocialNet'], function(SocialNet){
   SocialNet.initialize(); 
});
