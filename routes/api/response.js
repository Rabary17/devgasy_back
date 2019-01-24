var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var Response = mongoose.model('Response');
var Comment = mongoose.model('Comment');
var auth = require('../auth');

// post a new response
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


        return response.save().then(function(){
          comment.response = comment.response.concat([response]);
    
          return comment.save().then(function() {
            res.json({response: response.toAuthJSON(resolve[0])});
          });
        }).catch(next);

      })

    })
});

router.post('/:commentId', auth.required, function(req, res, next) {
    // console.log('request payload oooooooooooo ' + (req.body.response.body));
    
    Promise.resolve(Comment.findById(req.body.response.body)).then(function(response){
      
      return response.populate({
        path: 'response',
        populate: {
          path: 'author'
        },
        options: {
          sort: {
            createdAt: 'desc'
          }
        }
      }).execPopulate().then(function(response) {

        console.log('response promises' + (response));

        return res.json({responses: response});
      });
      
    }).catch(next);

  })

  module.exports = router;
