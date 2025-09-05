const {db} = require('../config/dbConfig');

class OTPUtils {
    static async generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async createOTP(userId, type = 'EMAIL_VERIFICATION') {
        const otp = await this.generateOTP();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        await db('otps').insert({
            otp,
            user_id: userId,
            type,
            expires_at: expiresAt
        });

        return otp;
    }

    static async verifyOTP(userId, otp, type = 'EMAIL_VERIFICATION') {
        const otpRecord = await db('otps')
            .where({
                user_id: userId,
                otp,
                type
            })
            .where('expires_at', '>', new Date())
            .orderBy('created_at', 'desc')
            .first();

        if (!otpRecord) {
            return false;
        }

        // Delete the used OTP
        await db('otps')
            .where('id', otpRecord.id)
            .delete();

        return true;
    }

    static async cleanupExpiredOTPs() {
        await db('otps')
            .where('expires_at', '<=', new Date())
            .delete();
    }
}

module.exports = OTPUtils;