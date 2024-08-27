// routes/user.js

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const middleware = require('../middleware');

// Route to get user profile by username
router.get('/:username', middleware.isLoggedIn, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).send("User not found.");
        }

        res.render('profile', { user }); // 'user' should match your HBS file name
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching the user profile.");
    }
});

module.exports = router;
