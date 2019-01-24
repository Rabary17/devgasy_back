var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  response: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
  utile:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {timestamps: true});

// Requires population of author
CommentSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    body: this.body,
    resp: this.response.length,
    utile: this.utile,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user)
  };
};

// vote comment

CommentSchema.methods.vote = function(id){
  if(this.utile.indexOf(id) === -1){
    // this.favorites.concat(id);
    this.utile = this.utile.concat([id]);
  }

  return this.save();
};
// unvote comment
CommentSchema.methods.unvote = function(idToRemove){
  this.utile = this.utile.filter(res => {
      res !== idToRemove
      // console.log('liste des votant apres' + res);
    }
  )
  return console.log('liste des votant apres' + this.utile);
    
// const items = ['a', 'b', 'c', 'd', 'e', 'f']
// const valueToRemove = 'c'
// const filteredItems = items.filter(item => item !== valueToRemove)

  
};
mongoose.model('Comment', CommentSchema);
