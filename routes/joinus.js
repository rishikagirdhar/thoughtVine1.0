const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com', // Your email
    pass: 'your-email-password' // Your email password
  }
});

router.post('/join-us', upload.single('resume'), (req, res) => {
  const { name, email, message } = req.body;
  const resumePath = req.file.path;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'your-email@gmail.com',
    subject: 'New Developer Joining Request',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    attachments: [
      {
        path: resumePath
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error occurred while sending email.');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Thank you for your interest! We will get back to you soon.');
    }
  });
});

module.exports = router;
