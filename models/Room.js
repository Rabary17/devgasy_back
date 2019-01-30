var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var RoomSchema = new mongoose.Schema({
  name: String,
}, {timestamps: true});


mongoose.model('Message', RoomSchema);
