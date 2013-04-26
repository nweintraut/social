module.exports = function(app){
    app.get('/account/authenticated', function(req, res, next){
       if (req.session.loggedIn) {
           res.send(200);
       } else {
           res.send(401);
       }
    });
};