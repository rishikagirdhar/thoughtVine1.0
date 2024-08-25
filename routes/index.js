const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const flash = require("connect-flash");



router.get("/", (req, res) => {
  res.render("landing");
});

//show register form
router.get("/register", (req, res) => {
  res.render("register");
});


// handle signup logic
router.post("/register", (req, res) => {
  const { username, emailId, password } = req.body;

  // Check if email is already taken
  User.findOne({ emailId: emailId }, (err, existingUser) => {
    if (err) {
      console.log(err);
      return res.render("register", { errorMessage: "An error occurred. Please try again." });
    }
    if (existingUser) {
      return res.render("register", { errorMessage: "Email is already registered." });
    }

    // Create new user
    var newUser = new User({ 
      username: username,
      emailId: emailId
    });
    
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.log(err);
        // Handle username already taken error
        return res.render("register", { errorMessage: err.message });
      }
      passport.authenticate("local")(req, res, () => {
        res.redirect("/posts");
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
