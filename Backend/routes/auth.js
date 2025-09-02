import express from 'express';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import auth from '../middleware/auth.js';
import router from express.Router();

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
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Create user
    const user = new User({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password,
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
    res.status(500).json({ 
      message: 'Server error during registration' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

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
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Update user budget
router.put('/budget', auth, async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    
    if (monthlyBudget < 0) {
      return res.status(400).json({ 
        message: 'Budget cannot be negative' 
      });
    }

    req.user.monthlyBudget = monthlyBudget;
    await req.user.save();

    res.json({ 
      message: 'Budget updated successfully',
      monthlyBudget: req.user.monthlyBudget 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error updating budget' 
    });
  }
});

module.exports = router;