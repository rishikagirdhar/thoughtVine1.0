const express = require("express");
const router = express.Router({ mergeParams: true });
const Post = require("../models/post");
const middleware = require("../middleware");

// Function for finding trending hashtags
const getTrendingHashtags = async () => {
  try {
    const posts = await Post.find({});
    const hashtagCount = {};

    posts.forEach(post => {
      post.hashtags.forEach(tag => {
        if (hashtagCount[tag]) {
          hashtagCount[tag]++;
        } else {
          hashtagCount[tag] = 1;
        }
      });
    });

    // Sort hashtags by count in descending order
    return Object.entries(hashtagCount)
                 .sort((a, b) => b[1] - a[1])
                 .map(entry => entry[0]);
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    throw error; // Rethrow or handle error as needed
  }
};

// Display all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({});
    const trendingHashtags = await getTrendingHashtags();

    res.render("posts/index", {
      posts: posts.reverse(),
      trendingHashtags,
      currentUser: req.user
    });
  } catch (err) {
    console.error("Error fetching posts or trending hashtags:", err);
    res.status(500).send("An error occurred while fetching posts or trending hashtags.");
  }
});

// Create new post
router.post("/", middleware.isLoggedIn, (req, res) => {
  const { name, image, description, hashtags } = req.body;
  const newPost = {
    name,
    image,
    description,
    author: {
      id: req.user._id,
      username: req.user.username
    },
    hashtags: hashtags.split(' ').map(tag => tag.trim())
  };

  Post.create(newPost, (err, newlyCreated) => {
    if (err) {
      console.log("Error in inserting into DB:", err);
      res.status(500).send("An error occurred while creating the post.");
    } else {
      res.redirect("/posts");
    }
  });
});

// Show form to create new post
router.get("/publish", middleware.isLoggedIn, (req, res) => {
  res.render("posts/new");
});

// Show post by ID
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .populate("comments")
    .exec((err, foundPost) => {
      if (err) {
        console.error("Error occurred in finding ID:", err);
        res.status(500).send("An error occurred while finding the post.");
      } else {
        res.render("posts/show", { post: foundPost });
      }
    });
});

// Edit post form
router.get("/:id/edit", middleware.checkPostOwnership, (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if (err) {
      console.error("Error finding post for edit:", err);
      res.status(500).send("An error occurred while fetching the post for editing.");
    } else {
      res.render("posts/edit", { post: foundPost });
    }
  });
});

// Update post
router.put("/:id", middleware.checkPostOwnership, (req, res) => {
  Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedPost) => {
    if (err) {
      console.error("Error updating post:", err);
      res.status(500).send("An error occurred while updating the post.");
    } else {
      res.redirect("/posts/" + req.params.id);
    }
  });
});

// Delete post
router.delete("/:id", middleware.checkPostOwnership, (req, res) => {
  Post.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      console.error("Error deleting post:", err);
      res.status(500).send("An error occurred while deleting the post.");
    } else {
      res.redirect("/posts");
    }
  });
});

module.exports = router;
