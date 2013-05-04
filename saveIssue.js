require('./models/mongodb_connection');
var mongoose    = require('mongoose');
    
var AccountSchema = new mongoose.Schema({
    email:      {type: String, unique: true},
    password:   {type: String, required: true},
    name: {
        first:  {type: String },
        last:   {type: String }
    },
    birthday: {
        day:    {type: Number, min: 1, max: 31, required: false},
        month:  {type: Number, min: 1, max: 12, required: false},
        year:   {type: Number, min: 1900, required: false}
    },
    photoUrl:   {type: String },
    biography:  {type: String },
});

var Account = mongoose.model('AccountTest', AccountSchema);

var account = new Account({email: "test2@email.com", password: "password"});



account.save(function(err, doc){
    if(err) {return console.log(err.message);}
    else {
        console.log (JSON.stringify(doc));
        doc.save(function(err, doc2){
           if(err) {return console.log(err.message);}
           else {
               console.log(JSON.stringify(doc2));
               doc2.remove(function(result){
                  console.log(result); 
               });
           }
        });
    }
});