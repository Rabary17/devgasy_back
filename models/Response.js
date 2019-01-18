var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var ResponseSchema = new mongoose.Schema({
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
}, {timestamps: true});

// Requires population of author
ResponseSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user)
  };
};

ResponseSchema.methods.toAuthJSON = function(user){
  return {
    id: this.id,
    body: this.body,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Response', ResponseSchema);
