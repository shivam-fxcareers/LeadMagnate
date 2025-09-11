const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for user creation
 */
const validateUserCreation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must not exceed 255 characters'),

    body('phone')
        .optional()
        .isMobilePhone('any', { strictMode: false })
        .withMessage('Please provide a valid phone number')
        .isLength({ max: 20 })
        .withMessage('Phone number must not exceed 20 characters'),

    body('organisation_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Organisation ID must be a positive integer'),

    body('role_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Role ID must be a positive integer'),

    body('send_email')
        .optional()
        .isBoolean()
        .withMessage('Send email must be a boolean value'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

/**
 * Validation middleware for user update
 */
const validateUserUpdate = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must not exceed 255 characters'),

    body('phone')
        .optional()
        .isMobilePhone('any', { strictMode: false })
        .withMessage('Please provide a valid phone number')
        .isLength({ max: 20 })
        .withMessage('Phone number must not exceed 20 characters'),

    body('organisation_id')
        .optional()
        .custom((value) => {
            if (value === null || value === '') {
                return true; // Allow null/empty to remove organization
            }
            if (!Number.isInteger(Number(value)) || Number(value) < 1) {
                throw new Error('Organisation ID must be a positive integer or null');
            }
            return true;
        }),

    body('role_id')
        .optional()
        .custom((value) => {
            if (value === null || value === '') {
                return true; // Allow null/empty to remove role
            }
            if (!Number.isInteger(Number(value)) || Number(value) < 1) {
                throw new Error('Role ID must be a positive integer or null');
            }
            return true;
        }),

    body('is_verified')
        .optional()
        .isBoolean()
        .withMessage('Is verified must be a boolean value'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean value'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

/**
 * Validation middleware for organization assignment
 */
const validateOrganisationAssignment = [
    body('organisation_id')
        .notEmpty()
        .withMessage('Organisation ID is required')
        .isInt({ min: 1 })
        .withMessage('Organisation ID must be a positive integer'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

/**
 * Validation middleware for role assignment
 */
const validateRoleAssignment = [
    body('role_id')
        .notEmpty()
        .withMessage('Role ID is required')
        .isInt({ min: 1 })
        .withMessage('Role ID must be a positive integer'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

/**
 * Validation middleware for password reset
 */
const validatePasswordReset = [
    body('send_email')
        .optional()
        .isBoolean()
        .withMessage('Send email must be a boolean value'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

/**
 * Validation middleware for user ID parameter
 */
const validateUserId = [
    body('id')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

module.exports = {
    validateUserCreation,
    validateUserUpdate,
    validateOrganisationAssignment,
    validateRoleAssignment,
    validatePasswordReset,
    validateUserId
};