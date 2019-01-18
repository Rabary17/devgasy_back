var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var Response = mongoose.model('Response');
var Comment = mongoose.model('Comment');
var auth = require('../auth');


router.post('/add', auth.required, function(req, res, next){

    Comment.findById(req.body.response.body.commentId).then(function(comment){
      if(!comment){ return res.sendStatus(401);}
      Promise.all([
        User.findById(req.body.response.body.userId).then(function(author){
          if(!author){ return res.sendStatus(401);}
          return author;
        })
      ]).then(function(resolve, reject){
        var response = new Response({body: req.body.response.body});


        response.body = req.body.response.body.body;
        response.comment = comment.id;
        response.author = resolve[0];

        console.log('comment' + comment.id);
        // response.comment = req.body.response.comment;
        // response.user = req.body.response.user;
     
        // res.sendStatus(401)
        // console.log('commentaire introuvable')
    
        response.save().then(function(){
          console.log('req.comment' + JSON.stringify(comment));
          comment.response = comment.response.concat([response]);
          return res.json({response: response.toAuthJSON()});
        }).catch(next);
      })

    })
    

});

  module.exports = router;
