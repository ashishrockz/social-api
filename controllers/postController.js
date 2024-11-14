const Post = require('../model/posts');
exports.getPosts = async (req, res) => {
    try {
      const posts = await Post.find().populate('user', 'username').sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching posts' });
    }
  };
  const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // or configure storage as needed

// Adjust your createPost function
exports.createPost = async (req, res) => {
  const { content } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Adjust according to your file handling logic

  try {
    const newPost = await Post.create({ 
      user: req.userId, 
      content, 
      imageUrl 
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ error: 'Error creating post', details: error.message });
  }
};
