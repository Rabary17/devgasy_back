var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var MessageSchema = new mongoose.Schema({
  body: {type: String},
  createdAt: {type: Date, default: Date.now()}
}, {timestamps: true});

// Requires population of author
MessageSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: this.body,
    createdAt: this.createdAt,
  };
};

MessageSchema.methods.toAuthJSON = function(user){
  return {
    id: this.id,
    body: this.body,
    sender: this.sender.toProfileJSONFor(user),
    recipient: this.recipient.toProfileJSONFor(user),
    createdAt: this.createdAt
  };
};


mongoose.model('Message', MessageSchema);
