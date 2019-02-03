var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Message = require('./Message');

var RoomSchema = new mongoose.Schema({
  name: {type: String, lowercase: true, unique: true},
  message: [{ type: String }],
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

RoomSchema.methods.mergeDiscussion = function(mes){
    // this.favorites.concat(id);
            console.log('new Date(now) ' + new Date());
  this.message = this.message.concat([mes]);
  return this.save();
};

mongoose.model('Room', RoomSchema);
