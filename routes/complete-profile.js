const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const middleware = require('../middleware');
const User = require('../models/user');  // Make sure to import the User model



// GET route to show the profile completion form
router.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    res.render('complete-profile'); // Render the complete-profile HBS template
  });
  
// Route to handle profile completion form submission
router.post('/', async (req, res) => {
  try {
      const { college, bio, profilePicture } = req.body; // Removed 'name' if it's not part of the schema

      // Ensure user is authenticated and has a valid session
      if (!req.user) {
          return res.redirect('/login');
      }

      // Update the user details in the database
      await User.findByIdAndUpdate(req.user._id, {
          college,
          bio,
          profilePicture
      }, { new: true }); // Option 'new: true' returns the updated document

      // Redirect to the user's profile page after updating the details
      res.redirect(`/user/${req.user.username}`);
  } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred while updating the profile. Please try again.");
  }
});
  
module.exports = router;