const nodemailer = require('nodemailer');

class EmailUtils {
    static transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
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
}

module.exports = EmailUtils;