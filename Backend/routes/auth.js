import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, monthlyBudget } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password: hashedPassword,
      monthlyBudget: monthlyBudget || 0
    });
    
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({ 
      message: 'User created successfully',
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is already populated by auth middleware
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove password from response
    const { password, ...userData } = req.user.toObject();
    res.json({ user: userData });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error loading profile', error: error.message });
  }
});

// Update user budget
router.put('/budget', auth, async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    if (monthlyBudget < 0) {
      return res.status(400).json({ message: 'Budget cannot be negative' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { monthlyBudget: monthlyBudget || 0 },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userData } = user.toObject();
    res.json({ 
      message: 'Budget updated successfully',
      user: userData 
    });
  } catch (error) {
    console.error('Budget update error:', error);
    res.status(500).json({ message: 'Server error updating budget', error: error.message });
  }
});

export default router;