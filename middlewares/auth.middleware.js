const JWTUtils = require('../utils/jwt.utils');

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }
    };
};

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Bearer token is required'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        try {
            const decoded = await JWTUtils.verifyToken(token);
            
            // Validate required payload fields
            if (!decoded.id || !decoded.email || !decoded.role_id || !decoded.organisation_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token payload'
                });
            }

            // Attach user data to request
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role_id: decoded.role_id,
                organisation_id: decoded.organisation_id
            };

            next();
        } catch (error) {
            if (error.message === 'Token has expired') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired'
                });
            }
            return res.status(403).json({
                success: false,
                message: error.message || 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const checkSuperAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (req.user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Superadmin privileges required.'
            });
        }

        next();
    } catch (error) {
        console.error('SuperAdmin check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    authenticateToken,
    checkSuperAdmin,
    validateRequest
};