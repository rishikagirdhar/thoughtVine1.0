
var passwordLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcryptjs");

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  emailId: { type: String, required: true, unique: true },
  password: String,
  profilePicture: { type: String, default: '/images/default-profile.png' },
  name: { type: String },
  bio: { type: String },
  college: { type: String },
  otherDetails: { type: String },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  // Additional fields as necessary
}, { timestamps: true });


// Hash the password before saving
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  bcrypt.hashSync(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compareSync(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

UserSchema.plugin(passwordLocalMongoose, {
  usernameField: 'username', // Here, we can specify the field name for the username
});

module.exports = mongoose.model("User", UserSchema);
