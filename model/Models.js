var mongoose = require('mongoose');

var noteSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  updated: { type: Date, default: Date.now },
});

var userSchema = new mongoose.Schema({
  email: {type: String, index: true, unique: true, lowercase: true, trim: true },
  password: {type: String, required: true},
  guid: {type: String, required: true},
  verified: {type: Boolean, required: true, default: false},
  notes: [noteSchema]
});

var UserModel = mongoose.model('User', userSchema);
var NoteModel = mongoose.model('Note', noteSchema);

exports.User = UserModel;
exports.Note = NoteModel;
