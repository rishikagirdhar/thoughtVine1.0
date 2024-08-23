const express = require('express');
const router = express.Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');

// GET route for showing the password reset form
router.get('/:token', (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() } // Check if the token is still valid
    }, (err, user) => {
        if (!user) {
            return res.render('forgot', { errorMessage: 'Password reset token is invalid or has expired.' });
        }
        res.render('reset', { token: req.params.token });
    });
});

// POST route for handling the password reset form submission
router.post('/:token', (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }, (err, user) => {
        if (!user) {
            return res.render('forgot', { errorMessage: 'Password reset token is invalid or has expired.' });
        }

        // Ensure proper hashing of the new password
        user.setPassword(req.body.password, (err) => {
            if (err) {
                return res.render('reset', { errorMessage: 'Error resetting the password. Please try again later.' });
            }

            // Clear the reset token fields
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // Save the updated user information
            user.save((err) => {
                if (err) {
                    return res.render('reset', { errorMessage: 'Error saving the new password. Please try again later.' });
                }

                // Send confirmation email
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'thoughtvinehelp@gmail.com', // Your email
                        pass: 'inwp mfpt gcvh namx'        // Your email password or app-specific password
                    }
                });

                const mailOptions = {
                    to: user.emailId,                     // User's email
                    from: 'thoughtvinehelp@gmail.com',         // Your email
                    subject: 'Your password has been changed',
                    text: `Hello,

This is a confirmation that the password for your account ${user.emailId} has just been changed.

If you did not make this change, please contact support immediately.

Thank you!`
                };

                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        console.log(err);
                        return res.render('reset', { errorMessage: 'Password was reset, but there was an issue sending the confirmation email.' });
                    }

                    // Log the user in automatically after password reset
                    req.logIn(user, (err) => {
                        if (err) {
                            return res.render('reset', { errorMessage: 'Password reset, but failed to log in automatically.' });
                        }
                        res.redirect('/posts'); // Redirect to a page after successful reset
                    });
                });
            });
        });
    });
});

module.exports = router;
