const express = require('express');
const router = express.Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Show forgot password form
router.get('/', (req, res) => {
  res.render('forgot');
});

// Handle forgot password form submission
router.post('/', (req, res) => {
  const { emailId } = req.body;

  User.findOne({ emailId: emailId }, (err, user) => {
    if (err || !user) {
      console.log(err || 'No user found with that email.');
      return res.render('forgot', { errorMessage: 'No account with that email address exists.' });
    }

    // Generate a reset token and set expiration
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    user.save(err => {
      if (err) {
        console.log(err);
        return res.render('forgot', { errorMessage: 'Error saving reset token. Please try again later.' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'thoughtvinehelp@gmail.com',
          pass: 'inwp mfpt gcvh namx'// Use environment variable for security
        }
      });

      const mailOptions = {
        to: user.emailId,
        from: 'thoughtvinehelp@gmail.com',
        subject: 'Password Reset Request',
        text: `Hello,

Please click on the following link to reset your password:

http://${req.headers.host}/reset/${user.resetPasswordToken}

If you did not request this, please ignore this email.

Thank you!`
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.render('forgot', { errorMessage: 'Error sending the email. Please try again later.' });
        }
        res.render('forgot', { successMessage: 'An email has been sent with instructions to reset your password.' });
      });
    });
  });
});

module.exports = router;
