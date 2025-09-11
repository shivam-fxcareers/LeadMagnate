const nodemailer = require('nodemailer');

class EmailUtils {
    static transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || process.env.SMTP_USER,
            pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    static async sendOTPEmail(email, otp, type = 'EMAIL_VERIFICATION') {
        let subject, title, message;

        switch (type) {
            case 'EMAIL_UPDATE':
                subject = 'Confirm Email Update - LeadMagnate';
                title = 'Email Update Confirmation';
                message = 'To confirm your email address update, please use the following OTP:';
                break;
            case 'PASSWORD_CHANGE':
                subject = 'Password Change Request - LeadMagnate';
                title = 'Password Change Request';
                message = 'To proceed with your password change request, please use the following OTP:';
                break;
            default: // EMAIL_VERIFICATION
                subject = 'Verify Your Email - LeadMagnate';
                title = 'Email Verification';
                message = 'Thank you for registering with LeadMagnate. To verify your email address, please use the following OTP:';
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">${title}</h2>
                    <p>${message}</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                        <strong>${otp}</strong>
                    </div>
                    <p>This OTP will expire in 15 minutes.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        This is an automated message, please do not reply.
                    </p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    /**
     * Send welcome email to new user
     * @param {string} email - User email
     * @param {string} name - User name
     * @param {string} password - Temporary password
     * @param {string} organizationName - Organization name (optional)
     */
    static async sendWelcomeEmail(email, name, password, organizationName = null) {
        const subject = `Welcome to LeadMagnate${organizationName ? ` - ${organizationName}` : ''}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>Welcome to LeadMagnate!</h1>
                        ${organizationName ? `<p>You've been added to <strong>${organizationName}</strong></p>` : ''}
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Hello ${name}!</h2>
                        <p>Your account has been created successfully. You can now access the LeadMagnate platform using the credentials below:</p>
                        
                        <div style="background: #fff; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
                            <h3>Your Login Credentials:</h3>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Temporary Password:</strong> <code style="background: #f4f4f4; padding: 2px 6px; border-radius: 3px;">${password}</code></p>
                        </div>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>Important:</strong> Please change your password after your first login for security purposes.
                        </div>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Login to LeadMagnate</a>
                        
                        <h3>What's Next?</h3>
                        <ul>
                            <li>Log in using your credentials</li>
                            <li>Complete your profile setup</li>
                            <li>Change your temporary password</li>
                            <li>Explore the platform features</li>
                        </ul>
                        
                        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                        <p>This email was sent by LeadMagnate. If you didn't expect this email, please contact support.</p>
                        <p>&copy; ${new Date().getFullYear()} LeadMagnate. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            throw error;
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @param {string} name - User name
     * @param {string} newPassword - New temporary password
     */
    static async sendPasswordResetEmail(email, name, newPassword) {
        const subject = 'LeadMagnate - Password Reset';
        
        const mailOptions = {
            from: process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>Password Reset</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Hello ${name}!</h2>
                        <p>Your password has been reset successfully. You can now log in using your new temporary password:</p>
                        
                        <div style="background: #fff; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
                            <h3>Your New Login Credentials:</h3>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>New Temporary Password:</strong> <code style="background: #f4f4f4; padding: 2px 6px; border-radius: 3px;">${newPassword}</code></p>
                        </div>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>Important:</strong> Please change this temporary password immediately after logging in for security purposes.
                        </div>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Login to LeadMagnate</a>
                        
                        <p>If you didn't request this password reset, please contact our support team immediately.</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                        <p>This email was sent by LeadMagnate. If you didn't expect this email, please contact support.</p>
                        <p>&copy; ${new Date().getFullYear()} LeadMagnate. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            throw error;
        }
    }
}

module.exports = EmailUtils;