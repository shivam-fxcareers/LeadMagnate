const express = require('express');
const router = express.Router();
const AuthController = require('./controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Routes
router.post('/signup', AuthController.signup);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/login', AuthController.login);

// Protected routes - require authentication
router.post('/update-email', authenticateToken, AuthController.requestEmailUpdate);
router.post('/verify-email-update', authenticateToken, AuthController.verifyEmailUpdate);

// Password change routes (can be used for both logged-in and non-logged-in users)
router.post('/request-password-change', AuthController.requestPasswordChange);
router.post('/verify-password-change', AuthController.verifyPasswordChange);

module.exports = router;