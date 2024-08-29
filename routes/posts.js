const express = require("express");
const router = express.Router({ mergeParams: true });
const Post = require("../models/post");
const middleware = require("../middleware/index");

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

    // Endpoint to get all posts
router.get('/posts/all', async (req, res) => {
  try {
      const posts = await Post.find().populate('author', 'username id'); // Populate author field with username and id
      res.json(posts);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
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

// Like Post
router.post("/:id/like", middleware.isLoggedIn, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    // Check if the user has already liked the post
    const userIndex = post.likedBy.indexOf(userId);

    if (userIndex !== -1) {
      // If user has already liked, remove their like (unlike)
      post.likes -= 1;
      post.likedBy.splice(userIndex, 1); // Remove user ID from likedBy array
    } else {
      // If user has not liked yet, add their like
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();

    res.json({ success: true, newLikeCount: post.likes, liked: userIndex === -1 });
  } catch (error) {
    console.error("Error toggling like on post:", error);
    res.status(500).json({ success: false, message: "An error occurred while toggling like on the post." });
  }
});


// Display all posts with sorting
router.get("/", async (req, res) => {
  try {
    const { filter } = req.query;
    let posts;

    switch (filter) {
      case 'most-liked':
        posts = await Post.find().sort({ likes: -1 }); // Sort by likes descending
        break;
      case 'most-recent':
        posts = await Post.find().sort({ createdAt: -1 }); // Sort by creation date descending
        break;
      default:
        posts = await Post.find().sort({ createdAt: -1 }); // Sort by creation date descending if no filter is applied
    }

    const trendingHashtags = await getTrendingHashtags();

    res.render("posts/index", {
      posts,
      trendingHashtags,
      currentUser: req.user, // Pass the current user
      isAuthenticated: req.isAuthenticated(), // Add isAuthenticated to check login status
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("An error occurred while fetching posts.");
  }
});

// Create new post
router.post("/", middleware.isLoggedIn, (req, res) => {
  const { name, description, hashtags } = req.body;
  const newPost = {
    name,
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