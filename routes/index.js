const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const flash = require("connect-flash");



router.get("/", (req, res) => {
  res.render("landing");
});

//show register form
router.post("/register", (req, res) => {
  const { username, emailId, password } = req.body;

  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if email is in valid format
  if (!emailRegex.test(emailId)) {
    return res.render("register", { errorMessage: "Please enter a valid email address." });
  }

  // Check if email is already taken
  User.findOne({ emailId: emailId }, (err, existingUser) => {
    if (err) {
      console.log(err);
      return res.render("register", { errorMessage: "An error occurred. Please try again." });
    }
    if (existingUser) {
      return res.render("register", { errorMessage: "Email is already registered." });
    }

    // Create new user instance without password field
    var newUser = new User({ 
      username: username,
      emailId: emailId
    });
    
    // Register user with passport-local-mongoose which handles password hashing
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.log(err);
        // Handle username already taken or other errors
        return res.render("register", { errorMessage: err.message });
      }

      // Automatically log the user in after registration and redirect
      passport.authenticate("local")(req, res, () => {
        res.redirect("/posts"); // Redirect to profile completion page
      });
    });
  });
});


// show login form
router.get("/login", (req, res) => {
  res.render("login");
});

//handle login logic
// ----------> router.post('/login', middleware, callback)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts", // Redirect to the profile page on success
    failureRedirect: "/login", // Redirect back to the login page on failure
    failureFlash: true, // Enable flash messages for failures
  }),
  (req, res) => {}
);

//logic route
router.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
