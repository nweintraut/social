/*
* From https://github.com/drudge/mongoose-findorcreate/blob/master/index.js
*/ 

function findOrCreatePlugin(schema, options) {
    schema.statics.findOrCreate = function findOrCreate(conditions, update, options, callback) {
        if (arguments.length < 4) {
            if (typeof options === 'function'){
                // Scenario: findOrCreate(coditions, update, callback)
                callback = options;
                options = {};
            } else if (typeof update === 'funciton') {
                // Scenario: findOrCreate(conditions, callback);
                callback = update;
                update = {};
                options = {};
            }
        }
        var self = this;
        this.findOne(conditions, function(err, result) {
           if(err || result) {
               // if no error, then there is an entry; now update entry if there's an upsert
               if (options && options.upsert && !err) {
                   // Note: Update does *not* return a document
                   self.update(conditions, update, function(err, numberOfDocsAffected, raw){
                       if (err) {
                           // Neil may want to handle error
                           console.log (err.message);
                           return callback(err, null, false);
                       } else {
                           if (numberOfDocsAffected != 1) {
                               console.log("Number of Docs updated was : [" + numberOfDocsAffected + "]");
                           }
                           self.findOne(conditions, function(err, result){
                              return callback(err, result, false); // false means that the record already existed
                           });
                       }
                   });
               } else {
                   // Only get here if there's either (a) an error or (b) no update
                   return callback(err, result, false);
               }
               
           }  else {
               for (var key in update) {
                   conditions[key] = update[key];
               }
               var obj = new self(conditions);
               obj.save(function(err, result) {
                   callback(err, result, true);
               });
           }
        });
    };
}

module.exports = findOrCreatePlugin;