const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Import the User model
const middleware = require("../middleware"); // Import middleware
const upload = require("../middleware/multer"); // Import the Multer configuration

// Route to display user profile
router.get('/:username', middleware.ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render('profile', { user }); // Render the profile view with the user data
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route to handle profile picture upload
router.post('/upload-profile-pic', middleware.ensureAuthenticated, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.profilePic = 'uploads/' + req.file.filename; // Update user profilePic field
    await user.save();

    // Send a JSON response with the filename
    res.json({ filename: req.file.filename });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
