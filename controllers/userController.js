// controllers/userController.js

const User = require('../models/user');
const Post = require('../models/post');

exports.getProfile = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).select('username name emailId college bio');
        const userPosts = await Post.find({ 'author.id': user._id }).populate('author.id', 'username');

        if (!user) {
            return res.status(404).render('error', { message: 'User not found' });
        }

        res.render('profile', {
            user,
            userPosts,
            currentUser: req.user // Assuming req.user contains the currently logged-in user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).render('error', { message: 'Server error' });
    }
};