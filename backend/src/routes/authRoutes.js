import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Registration & OTP verification
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Session management
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;