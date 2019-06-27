var mongoose = require('mongoose');

// security
const uuidv1 = require('uuid/v1');

var noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  updated: { type: Date, default: Date.now },
  pinned: { type: Boolean, default: false }
});

var userSchema = new mongoose.Schema({
  email: { type: String, index: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  guid: { type: String, required: true },
  tempGuid: { type: String },
  verified: { type: Boolean, required: true, default: false },
  notes: [noteSchema]
});

userSchema.statics.create = (email, hash, func) => {
    var UserModel = mongoose.model('User', userSchema);
    var NoteModel = mongoose.model('Note', noteSchema);
    var user = new UserModel({
        email: email,
        password: hash,
        guid: uuidv1(),
        notes: [NoteModel.create('Sample', 'This is your first note!')]
    });
    user.save().then(() => { func(user); });
};

userSchema.statics.get = (email, func) => {
    var UserModel = mongoose.model('User', userSchema);
    UserModel.findOne({email: email}, (err, user) => {
        if (err) {
            throw err;
        }

        if(user) {
            user.notes = user.notes.sort((a,b) =>
            {
                if (a.pinned && !b.pinned) {
                    return -1;
                } else if (b.pinned && !a.pinned) {
                    return 1;
                } else {
                    return (a.updated < b.updated) - (a.updated > b.updated);
                }
            });
        }

        func(err, user);
    });
};

userSchema.statics.delete = (email, func) => {
    var UserModel = mongoose.model('User', userSchema);
    UserModel.deleteOne({email: email}, (err) => {
        if (err) {
            throw err;
        }
        func(err);
    });
}

noteSchema.statics.create = (title, content) => {
    var NoteModel = mongoose.model('Note', noteSchema);
    return new NoteModel({title: title, content: content})
};

var UserModel = mongoose.model('User', userSchema);
var NoteModel = mongoose.model('Note', noteSchema);

exports.User = UserModel;
exports.Note = NoteModel;
