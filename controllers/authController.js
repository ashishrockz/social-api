const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const EmployeeModel = require('../model/User'); // Ensure this path is correct
const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'Token required' });

  jwt.verify(token, secretKey, (err, decoded) => { // Use correct variable: secretKey
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await EmployeeModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new EmployeeModel({ email, password: hashedPassword, username, role });

    await user.save();
    res.json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Fetch all users route
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await EmployeeModel.find({}).select('-password'); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Fetch a single user by ID route
router.get('/user/:id', verifyToken, async (req, res) => {
  try {
    const user = await EmployeeModel.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Fetch the logged-in user's data
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await EmployeeModel.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

module.exports = router;
