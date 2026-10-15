import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// Helper to sign JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;

    if (!name || !email || !password || !restaurantName) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Generate base slug from restaurant name + 4 random characters
    const cleanSlug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const restaurantSlug = `${cleanSlug}-${nanoid(4).toLowerCase()}`;

    const user = await User.create({
      name,
      email,
      password,
      restaurantName,
      restaurantSlug,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        restaurantName: user.restaurantName,
        restaurantSlug: user.restaurantSlug,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server registration error' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        restaurantName: user.restaurantName,
        restaurantSlug: user.restaurantSlug,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server login error' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      restaurantName: req.user.restaurantName,
      restaurantSlug: req.user.restaurantSlug,
    },
  });
};
