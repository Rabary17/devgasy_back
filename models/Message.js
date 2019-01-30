var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var MessageSchema = new mongoose.Schema({
  body: [{message : {
          type: String,
          },
          createdAt : {
            type: Date,
            default: Date.now,
        }}],
  envoyeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

// Requires population of author
MessageSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    envoyeur: this.author.toProfileJSONFor(user),
    destinataire: this.author.toProfileJSONFor(user)
  };
};

MessageSchema.methods.toAuthJSON = function(user){
  return {
    id: this.id,
    body: this.body,
    envoyeur: this.envoyeur,
    destinataire: this.destinataire,
  };
};

mongoose.model('Message', MessageSchema);
