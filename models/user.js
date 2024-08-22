const mongoose = require("mongoose");
var passwordLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcrypt")

var UserSchema = new mongoose.Schema({
  username: String,
  emailId: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
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
  // bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
  //   if (err) return callback(err);
  //   callback(null, isMatch);
  // });
  const prt = bcrypt.compareSync(candidatePassword, this.password);
  console.log(prt);
};
UserSchema.plugin(passwordLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
