var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var MessageSchema = new mongoose.Schema({
  body: String,
  createdAt: {type: Date, default: Date.now()}
}, {timestamps: true});

// Requires population of author
MessageSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
  };
};

MessageSchema.methods.toAuthJSON = function(user){
  return {
    id: this.id,
    body: this.body,
    createdAt: this.createdAt
  };
};


mongoose.model('Message', MessageSchema);
