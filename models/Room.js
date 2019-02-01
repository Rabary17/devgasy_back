var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var RoomSchema = new mongoose.Schema({
  name: {type: String, lowercase: true, unique: true},
  message: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
}, {timestamps: true});

// Requires population of author
RoomSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    name: this.body,
    message: this.message
  };
};

RoomSchema.methods.toAuthJSON = function(user){
  return {
    id: this._id,
    name: this.body,
    message: this.message,
    createdAt: this.createdAt
  };
};



mongoose.model('Room', RoomSchema);
