var router = require('express').Router();
var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var User = mongoose.model('User');


router.post('/new', function(req, res, next) {
    console.log(JSON.stringify(req.body.message));

    User.findById(req.body.idEnvoyeur).then(function(user){
        User.findById(req.body.idReceveur).then(function(userReceveur){
            var message = new Message();
            message.sender = user;
            message.recipient = userReceveur;
            message.body.message = message.body.concat([req.body.message]);
            message.save();
            console.log('envoyeur et receveur  ' + user + userReceveur);
        }).catch(next);
    }).catch(next);
  });

module.exports = router;
