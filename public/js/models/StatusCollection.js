/*
var statusCollection = new StatusCollection();
statusCollection.url = '/accounts/me/activity';
statusCollection.fetch();
*/
define(['models/Status'], function(Status) {
  var StatusCollection = Backbone.Collection.extend({
    model: Status
  });

  return StatusCollection;
});