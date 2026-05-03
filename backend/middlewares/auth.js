import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Authentication Middleware
 * Protects routes by verifying JWT access tokens
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please provide a valid token.',
    });
  }

  try {
    // Verify token using JWT utility
    const decoded = verifyAccessToken(token);

    // Fetch user from database (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    // Handle specific JWT errors
    if (error.message === 'Access token expired') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token.',
        code: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed',
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Restricts access based on user roles
 * Usage: authorize('admin', 'member')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't block if invalid
 * Useful for routes that work differently for authenticated vs unauthenticated users
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, continue without user
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');

    if (user) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    next();
  }
};

/**
 * Check if user owns the resource
 * Compares req.user.id with a specified field in req.params or req.body
 */
export const checkOwnership = (field = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    const resourceUserId = req.params[field] || req.body[field];

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: `${field} is required`,
      });
    }

    // Allow if user is admin or owns the resource
    if (
      req.user.role === 'admin' ||
      req.user.id.toString() === resourceUserId.toString()
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource',
    });
  };
};

export default {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
};

// Made with Bob
