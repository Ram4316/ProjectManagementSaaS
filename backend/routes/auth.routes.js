import express from 'express';
import {
  register,
  login,
  refreshAccessToken,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Public Routes
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user and get tokens
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', refreshAccessToken);

/**
 * Protected Routes (Require Authentication)
 */

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile (name, avatar)
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', protect, changePassword);

export default router;

// Made with Bob
