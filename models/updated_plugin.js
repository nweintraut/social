module.exports = exports = function updatedPlugin(schema, options){
    schema.add({updated: Date});
    schema.pre('save', function(next) {
        this.lastMod = new Date();
        next();
        });
    if (options&& options.index){
        schema.path('updated').index(options.index);
        }
    };