var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var MessageSchema = new mongoose.Schema({
  body: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {timestamps: true});

// Requires population of author
MessageSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    sender: this.sender.toProfileJSONFor(user)
  };
};

MessageSchema.methods.toAuthJSON = function(user){
  return {
    id: this.id,
    body: this.body,
    author: this.author,
    createdAt: this.createdAt
  };
};


mongoose.model('Message', MessageSchema);
