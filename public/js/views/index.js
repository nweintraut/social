
define(['SocialNetView', 'text!templates/index.html', 
        'views/status', 'models/Status'], 
    function(SocialNetView, indexTemplate, StatusView, Status){
        var indexView = SocialNetView.extend({
            el: $('#content'),
            events: {
                "submit #activityForm": "updateStatus"
            },
            initialize: function(options){ // added Chapter 10
                options.socketEvents.bind('status:me', this.onSocketStatusAdded, this); // added Chapter 10
                this.collection.on('add', this.onStatusAdded, this);
                this.collection.on('reset', this.onStatusCollectionReset, this);
            },
            onStatusCollectionReset: function(collection) {
                var that = this;
                collection.each(function(model) {
                   that.onStatusAdded(model); 
                });
            },
            onStatusAdded: function(status) {
                var statusHtml = (new StatusView({model: status})).render().el;
                $(statusHtml).prependTo('.status_list').hide().fadeIn('slow');
            },
            onSocketStatusAdded: function(data){
                var newStatus = data.data;
                var found = false;
                this.collection.forEach(function(status){
                    console.log("In index.onSocketStatusAdded : [" + status +"]");
                   var name = status.get('name');
                   if(name && name.full === newStatus.name.full && status.get('status') === newStatus.status ) { found = true;}
                });
            },
            updateStatus: function(){
                var statusText = $('input[name=status]').val();
                var statusCollection = this.collection;
                $.post('/accounts/me/status', {
                   status: statusText 
                }, function(data){
                    statusCollection.add(new Status({status: statusText}));
                });
                return false;
            },
            render: function(){
                this.$el.html(indexTemplate);
            }
        });
    return indexView;
});