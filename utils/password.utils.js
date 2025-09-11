const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a random password with specified length and complexity
 * @param {number} length - Password length (default: 12)
 * @param {object} options - Password options
 * @returns {string} Generated password
 */
function generateRandomPassword(length = 12, options = {}) {
    const defaultOptions = {
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true, // Exclude similar looking characters (0, O, l, 1, etc.)
        excludeAmbiguous: true // Exclude ambiguous characters
    };

    const config = { ...defaultOptions, ...options };

    let charset = '';
    
    if (config.includeLowercase) {
        charset += config.excludeSimilar ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    
    if (config.includeUppercase) {
        charset += config.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    
    if (config.includeNumbers) {
        charset += config.excludeSimilar ? '23456789' : '0123456789';
    }
    
    if (config.includeSymbols) {
        charset += config.excludeAmbiguous ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
    }

    if (charset === '') {
        throw new Error('At least one character type must be included');
    }

    let password = '';
    const charsetLength = charset.length;

    // Ensure at least one character from each selected type
    if (config.includeLowercase) {
        const lowerChars = config.excludeSimilar ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
        password += lowerChars[crypto.randomInt(0, lowerChars.length)];
    }
    
    if (config.includeUppercase) {
        const upperChars = config.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        password += upperChars[crypto.randomInt(0, upperChars.length)];
    }
    
    if (config.includeNumbers) {
        const numberChars = config.excludeSimilar ? '23456789' : '0123456789';
        password += numberChars[crypto.randomInt(0, numberChars.length)];
    }
    
    if (config.includeSymbols) {
        const symbolChars = config.excludeAmbiguous ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
        password += symbolChars[crypto.randomInt(0, symbolChars.length)];
    }

    // Fill the rest of the password length with random characters
    for (let i = password.length; i < length; i++) {
        password += charset[crypto.randomInt(0, charsetLength)];
    }

    // Shuffle the password to avoid predictable patterns
    return shuffleString(password);
}

/**
 * Shuffle a string randomly
 * @param {string} str - String to shuffle
 * @returns {string} Shuffled string
 */
function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

/**
 * Generate a secure random password for temporary use
 * @returns {string} Temporary password
 */
function generateTemporaryPassword() {
    return generateRandomPassword(10, {
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false, // Avoid symbols for easier typing
        excludeSimilar: true,
        excludeAmbiguous: true
    });
}

/**
 * Generate a strong password for permanent use
 * @returns {string} Strong password
 */
function generateStrongPassword() {
    return generateRandomPassword(16, {
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true,
        excludeAmbiguous: true
    });
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password, saltRounds = 12) {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error('Failed to hash password: ' + error.message);
    }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
async function comparePassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error('Failed to compare password: ' + error.message);
    }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and feedback
 */
function validatePasswordStrength(password) {
    const result = {
        score: 0,
        strength: 'Very Weak',
        feedback: [],
        isValid: false
    };

    if (!password || typeof password !== 'string') {
        result.feedback.push('Password is required');
        return result;
    }

    // Length check
    if (password.length >= 8) {
        result.score += 1;
    } else {
        result.feedback.push('Password must be at least 8 characters long');
    }

    if (password.length >= 12) {
        result.score += 1;
    }

    // Character type checks
    if (/[a-z]/.test(password)) {
        result.score += 1;
    } else {
        result.feedback.push('Password must contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
        result.score += 1;
    } else {
        result.feedback.push('Password must contain uppercase letters');
    }

    if (/[0-9]/.test(password)) {
        result.score += 1;
    } else {
        result.feedback.push('Password must contain numbers');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
        result.score += 1;
    } else {
        result.feedback.push('Password must contain special characters');
    }

    // Common patterns check
    const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /(.)\1{2,}/ // Repeated characters
    ];

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
    if (hasCommonPattern) {
        result.score -= 1;
        result.feedback.push('Password contains common patterns');
    }

    // Determine strength
    if (result.score >= 5) {
        result.strength = 'Very Strong';
        result.isValid = true;
    } else if (result.score >= 4) {
        result.strength = 'Strong';
        result.isValid = true;
    } else if (result.score >= 3) {
        result.strength = 'Medium';
        result.isValid = true;
    } else if (result.score >= 2) {
        result.strength = 'Weak';
    } else {
        result.strength = 'Very Weak';
    }

    return result;
}

/**
 * Generate a password reset token
 * @returns {string} Reset token
 */
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a verification token
 * @returns {string} Verification token
 */
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    generateRandomPassword,
    generateTemporaryPassword,
    generateStrongPassword,
    hashPassword,
    comparePassword,
    validatePasswordStrength,
    generateResetToken,
    generateVerificationToken
};