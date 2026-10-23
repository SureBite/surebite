import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js';
import {
  validateManagerName,
  validateRestaurantName,
  validateGmailAuthentic,
  validatePassword,
} from '../utils/validators.js';

// Helper to sign JWT with exactly 7-day expiration
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper to format safe public user object
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  restaurantName: user.restaurantName,
  restaurantSlug: user.restaurantSlug,
});

// Helper to generate a 6-digit numeric OTP
const generateNumericOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * POST /api/auth/register
 * Initiates registration with strict validation:
 * - Manager name > 4 letters
 * - Restaurant name > 4 letters
 * - Authentic Gmail verification
 * - Password with uppercase, lowercase, numbers (min 8 chars)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;

    // 1. Manager name must be more than 4 letters
    const nameCheck = validateManagerName(name);
    if (!nameCheck.isValid) {
      return res.status(400).json({ message: nameCheck.message });
    }

    // 2. Restaurant name must be more than 4 letters
    const restCheck = validateRestaurantName(restaurantName);
    if (!restCheck.isValid) {
      return res.status(400).json({ message: restCheck.message });
    }

    // 3. Email address must be an authentic Gmail address
    const emailCheck = await validateGmailAuthentic(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ message: emailCheck.message });
    }
    const normalizedEmail = emailCheck.email;

    // 4. Password must contain uppercase, lowercase, numbers (min 8 chars)
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      return res.status(400).json({ message: passCheck.message });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Generate slug
    const cleanSlug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const restaurantSlug = `${cleanSlug}-${nanoid(4).toLowerCase()}`;

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user record
      existingUser.name = name.trim();
      existingUser.password = password;
      existingUser.restaurantName = restaurantName.trim();
      existingUser.restaurantSlug = restaurantSlug;
      await existingUser.save();
    } else {
      // Create new unverified user
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        restaurantName: restaurantName.trim(),
        restaurantSlug,
        isVerified: false,
      });
    }

    // Generate secure 6-digit OTP
    const otp = generateNumericOtp();

    // Store in Otp collection with 10-minute TTL expiration index
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({ email: normalizedEmail, otp });

    // Send OTP email
    await sendOtpEmail(normalizedEmail, otp);

    return res.status(201).json({
      message: 'Registration initiated. Please verify the 6-digit OTP sent to your email.',
      email: normalizedEmail,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server registration error.' });
  }
};

/**
 * POST /api/auth/verify-otp
 * Validates the 6-digit OTP, activates the user account, and attaches 7-day httpOnly cookie.
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Verify OTP document
    const otpDoc = await Otp.findOne({ email: normalizedEmail, otp: cleanOtp });
    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new code.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    // Activate user
    user.isVerified = true;
    await user.save();

    // Clean up OTP records for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // Issue 7-day token and attach as httpOnly cookie
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: 'Email verified successfully. Welcome to SureBite!',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'OTP verification failed.' });
  }
};

/**
 * POST /api/auth/resend-otp
 * Resends a fresh 6-digit OTP for unverified user.
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'Account not found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please sign in.' });
    }

    const otp = generateNumericOtp();
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({ email: normalizedEmail, otp });

    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      message: 'A fresh 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to resend OTP.' });
  }
};

/**
 * POST /api/auth/login
 * Validates credentials and verified status, attaches 7-day httpOnly cookie, returns user object.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Your account is not verified yet. Please verify the OTP sent to your email.',
        isUnverified: true,
        email: user.email,
      });
    }

    // Issue 7-day token and attach as httpOnly cookie
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    // Stop sending the JWT in JSON response - only return user profile
    return res.status(200).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server login error.' });
  }
};

/**
 * POST /api/auth/logout
 * Clears the httpOnly auth cookie
 */
export const logout = async (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out successfully.' });
};

/**
 * POST /api/auth/forgot-password
 * Generates random reset token via crypto, saves SHA-256 hash with 15-min expiration, emails reset URL.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate random reset token using native crypto module
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash the token before storing in database
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set 15-minute expiration timestamp
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      // Email the user a reset URL formatted like http://localhost:5173/reset-password/<plain_token>
      const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

      await sendPasswordResetEmail(user.email, resetUrl);
    }

    // Always return safe friendly message to prevent email enumeration attacks
    return res.status(200).json({
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to process forgot password request.' });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Verifies token, hashes new password, updates DB, and clears temporary reset token fields.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      return res.status(400).json({ message: passCheck.message });
    }

    // Hash the token from URL parameter to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset link. Please request a new one.' });
    }

    // Update password (pre-save hook will hash it) and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to reset password.' });
  }
};

/**
 * GET /api/auth/me
 * Returns authenticated user details
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    user: sanitizeUser(req.user),
  });
};
