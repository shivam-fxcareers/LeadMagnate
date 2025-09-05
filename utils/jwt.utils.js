const jwt = require('jsonwebtoken');

class JWTUtils {
    static validateSecret() {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        if (process.env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long');
        }
    }

    static generateToken(payload) {
        this.validateSecret();
        const expiresIn = process.env.JWT_EXPIRES_IN || '72h';
        const token = jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn,
            algorithm: 'HS256'
        });
        const decoded = jwt.decode(token);
        return {
            token,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        };
    }

    static verifyToken(token) {
        this.validateSecret();
        try {
            return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    static generateLoginToken({ id, email, role_id, organisation_id }) {
        return this.generateToken({
            id,
            email,
            role_id,
            organisation_id
        });
    }
}

module.exports = JWTUtils;