const Post = require('../model/posts');

exports.createPost = async (req, res) => {
  const { content, imageUrl } = req.body;
  try {
    const newPost = await Post.create({ user: req.userId, content, imageUrl });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: 'Error creating post' });
  }
};
exports.getPosts = async (req, res) => {
    try {
      const posts = await Post.find().populate('user', 'username').sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching posts' });
    }
  };
  