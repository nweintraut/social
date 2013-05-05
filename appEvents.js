var events = require('events');
module.exports = function(app){
    var eventDispatcher = new events.EventEmitter();
    app.addEventListener = function(eventName, callback){
      eventDispatcher.on(eventName, callback);
    };
    app.removeEventListener = function(eventName, callback){
      eventDispatcher.removeListener(eventName, callback);  
    };
    app.triggerEvent = function(eventName, eventOptions){
        eventDispatcher.emit(eventName, eventOptions);
    };
};