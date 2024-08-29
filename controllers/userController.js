// controllers/userController.js

const Post = require('../models/post');

// In controllers/userController.js
const User = require('../models/user');

// Display and edit user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate('posts')
            .exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        const postsCount = user.posts.length;
        const totalLikes = user.posts.reduce((acc, post) => acc + post.likesCount, 0);
        const totalComments = user.posts.reduce((acc, post) => acc + post.commentsCount, 0);

        res.render('profile', {
            user,
            postsCount,
            totalLikes,
            totalComments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching user data.');
    }
};

module.exports.checkUserOwnership = async (req, res, next) => {
    try {
        const userId = req.user._id; // Ensure `req.user` is set by authentication middleware
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user || user._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
// In your controllers/userController.js
exports.updateProfile = async (req, res) => {
    try {
        const username = req.params.username;
        const { name, college, bio } = req.body;
        const profilePicture = req.file ? req.file.path : null; // Handle file upload

        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update user details
        user.name = name || user.name;
        user.college = college || user.college;
        user.bio = bio || user.bio;
        if (profilePicture) {
            user.profilePicture = profilePicture;
        }

        await user.save();

        res.redirect(`/user/${username}`);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Internal Server Error');
    }
};
