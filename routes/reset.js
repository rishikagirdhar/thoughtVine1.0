const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
// Render the password reset form
router.get('/:token', (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }, (err, user) => {
    if (err || !user) {
      console.log(err || 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }

    // Render the reset form if the token is valid
    res.render('reset', { token: req.params.token });
  });
});

// Handle password reset form submission
router.post('/:token', (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }, (err, user) => {
    if (err || !user) {
      console.log(err || 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }

    // Hash the new password before saving
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.save(err => {
      if (err) {
        console.log(err);
        return res.redirect('/forgot');
      }

        // Send email confirmation
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'thoughtvinehelp@gmail.com',
            pass: 'inwp mfpt gcvh namx' // Use environment variable for security
          }
        });

        const mailOptions = {
          to: user.emailId,
          from: 'thoughtvinehelp@gmail.com',
          subject: 'Password Changed',
          text: `Hello,

This is a confirmation that the password for your account has just been changed.

Thank you!`
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.log(err);
          }
          res.redirect('/login');
        });
      });
    });
  });


module.exports = router;
