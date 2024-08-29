const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const User = require('../models/user');
const Post = require('../models/post');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profilePictures');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Method to calculate posts count
async function calculatePostsCount(userId) {
    try {
        const count = await Post.countDocuments({ author: userId });
        return count;
    } catch (error) {
        console.error('Error calculating posts count:', error);
        return 0;
    }
}

// Method to calculate total likes
async function calculateTotalLikes(userId) {
    try {
        const posts = await Post.find({ author: userId });
        const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
        return totalLikes;
    } catch (error) {
        console.error('Error calculating total likes:', error);
        return 0;
    }
}

// Method to calculate total comments
async function calculateTotalComments(userId) {
    try {
        const posts = await Post.find({ author: userId });
        const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
        return totalComments;
    } catch (error) {
        console.error('Error calculating total comments:', error);
        return 0;
    }
}

// Import checkUserOwnership from userController
const { checkUserOwnership } = userController;

// Route to update user profile
router.post('/:username/update',
    [
        body('name').optional().isString().trim(),
        body('college').optional().isString().trim(),
        body('bio').optional().isString().trim()
    ],
    checkUserOwnership, upload.single('profilePicture'), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { username } = req.params;
            const { name, college, bio } = req.body;
            const profilePicture = req.file ? req.file.filename : null;

            // Find the user and update fields
            const user = await User.findOne({ username: username });
            if (!user) return res.status(404).send('User not found');

            if (name) user.name = name;
            if (college) user.college = college;
            if (bio) user.bio = bio;
            if (profilePicture) user.profilePicture = profilePicture;

            // Save updated user
            await user.save();
            
            // Update statistics
            user.postsCount = await calculatePostsCount(user._id);
            user.totalLikes = await calculateTotalLikes(user._id);
            user.totalComments = await calculateTotalComments(user._id);

            // Save updated statistics
            await user.save();
            
            res.redirect(`/user/${username}`);
        } catch (error) {
            res.status(500).send('Server error');
        }
    });

router.get('/:username', userController.getProfile);

module.exports = router;