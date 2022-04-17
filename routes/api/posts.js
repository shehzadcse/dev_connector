const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Posts = require('../../models/Posts');

const Post = require('../../models/Posts');
const User = require('../../models/User');
// const checkObjectId = require('../../middleware/checkObjectId');

// @route   POST api/posts
// @desc    Create Post
// @access  Private
router.post('/', [auth, check('text', 'Text is required').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.user.id).select('-password');
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts
// @desc    Get All Posts
// @access  Private

router.get('/', auth, async (req, res) => {
  try {
    const allPost = await Posts.find().sort({ date: -1 });
    res.json(allPost)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})

// @route   GET api/posts/:id
// @desc    Get Post by id
// @access  Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" })
    }
    res.json(post)
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: "Post Not Found" })
    }
    res.status(500).send('Server Error');
  }

})

// @route   DELETE api/posts/:id
// @desc    Delete Post by id
// @access  Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" })
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" })
    }
    await post.remove();
    res.json({ msg: "Post Removed" })
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: "Post Not Found" })
    }
    res.status(500).send('Server Error');
  }

})


module.exports = router;
