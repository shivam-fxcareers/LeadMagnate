const AuthModel = require('./model');
const EmailUtils = require('../utils/email.utils');
const OTPUtils = require('../utils/otp.utils');
const JWTUtils = require('../utils/jwt.utils');

class AuthController {
    static async signup(req, res) {
        try {
            const { name, email, phone, password } = req.body;

            // Check if email already exists
            const existingEmail = await AuthModel.findUserByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Check if phone already exists
            const existingPhone = await AuthModel.findUserByPhone(phone);
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already registered'
                });
            }

            // Create user
            const userId = await AuthModel.createUser({
                name,
                email,
                phone,
                password
            });

            // Generate and send OTP
            const otp = await OTPUtils.createOTP(userId);
            const emailSent = await EmailUtils.sendOTPEmail(email, otp);

            if (!emailSent) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send verification email'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email for verification OTP.'
            });

        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;

            // Find user with matching OTP
            const user = await AuthModel.findUserWithOTP(email, otp);

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP'
                });
            }

            // Mark user as verified
            await AuthModel.verifyUser(user.id);

            // Delete the used OTP
            await OTPUtils.verifyOTP(user.id, otp);

            res.json({
                success: true,
                message: 'Email verified successfully. Please log in.'
            });

        } catch (error) {
            console.error('Email verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user with organisation and role details
            const user = await AuthModel.login(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if user is verified
            if (!user.is_verified) {
                return res.status(401).json({
                    success: false,
                    message: 'Please verify your email before logging in'
                });
            }

            // Verify password
            const isValidPassword = await AuthModel.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate token with expiry
            const { token, expiresAt } = JWTUtils.generateLoginToken({
                id: user.id,
                email: user.email,
                role_id: user.role_id,
                organisation_id: user.organisation_id
            });

            // Prepare response data
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_verified: user.is_verified,
                organisation: {
                    id: user.organisation_id,
                    name: user.organisation_name
                },
                role: {
                    id: user.role_id,
                    name: user.role_name
                }
            };

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    token,
                    expiresAt
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }


    static async requestEmailUpdate(req, res) {
        try {
            const { new_email } = req.body;
            const userId = req.user.id;

            // Find user and check verification status
            const user = await AuthModel.findUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.is_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'Please verify your current email first'
                });
            }

            // Check if new email is already in use
            const existingUser = await AuthModel.findUserByEmail(new_email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }

            // Generate and save OTP
            const otp = await OTPUtils.createOTP(userId, 'EMAIL_UPDATE');
            const emailSent = await EmailUtils.sendOTPEmail(new_email, otp, 'EMAIL_UPDATE');

            if (!emailSent) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send verification email'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Verification email sent to new email address'
            });

        } catch (error) {
            console.error('Email update request error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async verifyEmailUpdate(req, res) {
        try {
            const { new_email, otp } = req.body;
            const userId = req.user.id;

            // Find user with OTP
            const userWithOTP = await AuthModel.findUserWithOTPById(userId, otp);
            if (!userWithOTP) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP'
                });
            }

            // Verify OTP
            const isValid = await OTPUtils.verifyOTP(userId, otp, 'EMAIL_UPDATE');
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP'
                });
            }

            // Update email
            await AuthModel.updateUserEmail(userId, new_email);

            return res.status(200).json({
                success: true,
                message: 'Email updated successfully'
            });

        } catch (error) {
            console.error('Email update verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async requestPasswordChange(req, res) {
        try {
            const { email } = req.body;

            // Find user by email
            const user = await AuthModel.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate and save OTP
            const otp = await OTPUtils.createOTP(user.id, 'PASSWORD_CHANGE');
            const emailSent = await EmailUtils.sendOTPEmail(email, otp, 'PASSWORD_CHANGE');

            if (!emailSent) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send OTP email'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Password change OTP sent to your email'
            });

        } catch (error) {
            console.error('Password change request error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async verifyPasswordChange(req, res) {
        try {
            const { email, otp, new_password } = req.body;

            // Find user by email
            const user = await AuthModel.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify OTP
            const isValid = await OTPUtils.verifyOTP(user.id, otp, 'PASSWORD_CHANGE');
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP'
                });
            }

            // Update password
            await AuthModel.updateUserPassword(user.id, new_password);

            return res.status(200).json({
                success: true,
                message: 'Password updated successfully'
            });

        } catch (error) {
            console.error('Password change verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = AuthController;