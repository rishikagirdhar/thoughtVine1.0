const mongoose = require('mongoose');

// Define the Post schema
const postSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  hashtags: [String],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{  // New field to track users who have liked the post
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model('Post', postSchema);