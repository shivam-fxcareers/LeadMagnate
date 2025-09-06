const express = require('express');
const router = express.Router();
const AuthController = require('./controller');
const { authenticateToken, validateRequest } = require('../middlewares/auth.middleware');

// Validation schemas
const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long')
});

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    password: z.string().min(8, 'Password must be at least 8 characters long')
});

const verifyEmailSchema = z.object({
    email: z.string().email('Invalid email format'),
    otp: z.string().length(6, 'OTP must be 6 digits')
});

// Routes
router.post('/signup', validateRequest(signupSchema), AuthController.signup);
router.post('/verify-email', validateRequest(verifyEmailSchema), AuthController.verifyEmail);
router.post('/login', validateRequest(loginSchema), AuthController.login);

const emailUpdateSchema = z.object({
    new_email: z.string().email('Invalid email format')
});

const emailUpdateVerifySchema = z.object({
    new_email: z.string().email('Invalid email format'),
    otp: z.string().length(6, 'OTP must be 6 digits')
});

// Password change schemas
const requestPasswordChangeSchema = z.object({
    email: z.string().email('Invalid email format')
});

const verifyPasswordChangeSchema = z.object({
    email: z.string().email('Invalid email format'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    new_password: z.string().min(8, 'New password must be at least 8 characters long')
});

// Protected routes - require authentication
router.post('/update-email', authenticateToken, validateRequest(emailUpdateSchema), AuthController.requestEmailUpdate);
router.post('/verify-email-update', authenticateToken, validateRequest(emailUpdateVerifySchema), AuthController.verifyEmailUpdate);

// Password change routes (can be used for both logged-in and non-logged-in users)
router.post('/request-password-change', validateRequest(requestPasswordChangeSchema), AuthController.requestPasswordChange);
router.post('/verify-password-change', validateRequest(verifyPasswordChangeSchema), AuthController.verifyPasswordChange);

module.exports = router;