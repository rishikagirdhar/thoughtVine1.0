const mongoose = require("mongoose");
var passwordLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcrypt");

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  emailId: { type: String, required: true, unique: true },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profilePicture: String,  // URL or path to the user's profile picture
  bio: String,             // A short biography or user description
  otherDetails: String,    // Any additional details you want to store
  college: String          // New field for user's college
});

// Hash the password before saving
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

UserSchema.plugin(passwordLocalMongoose, {
  usernameField: 'username', // Here, we can specify the field name for the username
});

module.exports = mongoose.model("User", UserSchema);