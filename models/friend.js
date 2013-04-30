require('./mongodb_connection');
var     mongoose    = require('mongoose')
    ,   Schema      = mongoose.Schema;

var FriendSchema = new mongoose.Schema({
    friender:   {type: Schema.Types.ObjectId, ref: "Account", index: true},
    friend:     {type: Schema.Types.ObjectId, ref: "Account", index: true },
    added:      {type: Date},
    updated:    {type: Date}
});

FriendSchema.index({"friender": 1, "friend": 1}, {unique: true});

FriendSchema.statics.getFriendships = function(me, callback) {
    Friend
        .find({friender: me})
        .populate({
            path: 'friend',
            select: 'name _id',  // another possible condition is:  match: {age: {$gte:21}}
            options: {limit: 50}
        })
        .exec(callback);
};





/* callback(err, friendship) */
FriendSchema.statics.findFrienship = function(myId, friendId, callback){
  (function(myId1, friendId1, callback1){
      Friend.find().or({friender: myId1, friend: friendId1}, {friender: friendId1, friend: myId1}).exec(callback1);     
  })(myId, friendId, callback);
};

FriendSchema.statics.createFriendship = function(myId, friendId, callback){
    (function(myId1, friendId1, callback1){
        Friend.find().or({friender: myId1, friend: friendId1}, {friender: friendId1, friend: myId1}).exec(
            function(err, docs, count){
                if(err) {return callback1(err, null);}
                else if (!docs) {return callback1(new Error("Friendship already exists"));} 
                else {
                    console.log("Err: [" + err + "] [" + docs +"] [" + count +"]");
                    var date = new Date();
                    var friendShip = 
                       new Friend({friender: myId1, friend: friendId1, added: date, updated: date});
                    friendShip.save(function(err, fs, count) { 
                        if(err){return callback1(err, null);}     
                        else {
                            callback1(null, fs);
                        }
                });               
            }
        });
    })(myId, friendId, callback);
};
FriendSchema.statics.deleteFriendship = function(myId, friendId, callback){
    (function(myId1, friendId1, callback1){
        Friend.find().or({friender: myId1, friend: friendId1}, {friender: friendId1, friend: myId1}).exec(
            function(err, docs, count){
                if(err) {return callback1(err, null);}
                else if (!docs || !Array.isArray(docs) || docs.length === 0) {
                    return callback1(new Error("Friendship doesn't exist"), null);
                } 
                else {
                    docs.forEach(function(doc){
                        console.log("Removing friendship: " + doc);
                        doc.remove(function(err){
                            console.log(err);
                        });
                    });
                    callback(null);
                }
            });
    })(myId, friendId, callback);
};
FriendSchema.statics.createFriendship2 = function(myId, friendId, callback){
    (function(myId1, friendId1, callback1){
        Friend.find({friender: myId, friend: friendId1}, function(err, docs){
            if(err) {return callback1(err, null);}
            else {
                if(!docs) {return callback1(new Error("Friendship aleady exists"));}
                else {
                    var date = new Date();
                    var friendShip1 = 
                        new Friend({friender: myId1, friend: friendId1, added: date, updated: date});
                        friendShip1.save(function(err, fs1, count) {
                            if (err){return callback1(err, null);}
                            else {
                                var friendShip2 =
                                    new Friend({friender: friendShip1.friend, friend: friendShip1.friender,
                                                added: friendShip1.added, updated: friendShip1. updated});
                                friendShip2.save(function(err, fs2, count2){
                                   if(err){return callback1(err, null);}
                                   return callback1(null, [fs1, fs2]);
                                });
                            }
                        });
                }
            }
        });
    })(myId, friendId, callback);
};
/*
FriendSchema.statics.endFriendship = function(myId, friendId, callback){
  (function(myId1, friendId1, callback1){
      Friend.findOneAndRemove({friender: myId, friend: friendId1}, function(err, docs){)
  })(myId, friendId, callback);  
};
*/
var Friend = mongoose.model('Friend', FriendSchema);
module.exports = Friend;

