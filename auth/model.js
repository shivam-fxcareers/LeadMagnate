const { db } = require('../config/dbConfig');
const bcrypt = require('bcryptjs');

class AuthModel {
    static async createUser({ name, email, phone, password }) {
        const hashedPassword = await bcrypt.hash(password, 12);

        const [userId] = await db('users').insert({
            name,
            email,
            phone,
            password: hashedPassword,
            is_verified: false
        });

        return userId;
    }

    static async findUserByEmail(email) {
        return db('users')
            .where('email', email)
            .first();
    }

    static async findUserByPhone(phone) {
        return db('users')
            .where('phone', phone)
            .first();
    }

    static async verifyUser(userId) {
        await db('users')
            .where('id', userId)
            .update({
                is_verified: true
            });
    }

    static async findUserWithOTP(email, otp) {
        return db('users')
            .join('otps', 'users.id', '=', 'otps.user_id')
            .where({
                'users.email': email,
                'otps.otp': otp,
                'otps.type': 'EMAIL_VERIFICATION'
            })
            .where('otps.expires_at', '>', new Date())
            .select('users.*', 'otps.id as otp_id')
            .first();
    }
    static async login(email) {
        return db('users')
            .select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.password',
                'users.is_verified',
                'users.organisation_id',
                'users.role_id',
                'organisations.name as organisation_name',
                'roles.name as role_name'
            )
            .leftJoin('organisations', 'users.organisation_id', 'organisations.id')
            .leftJoin('roles', 'users.role_id', 'roles.id')
            .where('users.email', email)
            .first();
    }

    static async getUserModulePermissions(userId) {
        const user = await db('users')
            .where('users.id', userId)
            .first();

        if (!user || !user.role_id) {
            return [];
        }

        return db('role_permissions as rp')
            .select(
                'rp.module_id',
                'm.name as module_name',
                'rp.can_create',
                'rp.can_read',
                'rp.can_update',
                'rp.can_delete',
                'rp.scope'
            )
            .join('modules as m', 'm.id', 'rp.module_id')
            .where('rp.role_id', user.role_id)
            .orderBy('m.name');
    }

    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }


    static async findUserById(userId) {
        try {
            const user = await db('users')
                .where('id', userId)
                .first();
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    static async updateUserEmail(userId, newEmail) {
        try {
            await db('users')
                .where('id', userId)
                .update({
                    email: newEmail,
                    updated_at: db.fn.now()
                });
            return true;
        } catch (error) {
            console.error('Error updating user email:', error);
            throw error;
        }
    }

    static async findUserWithOTPById(userId, otp) {
        try {
            const result = await db('users')
                .join('otps', 'users.id', 'otps.user_id')
                .where({
                    'users.id': userId,
                    'otps.otp': otp,
                    'otps.type': 'EMAIL_UPDATE'
                })
                .where('otps.expires_at', '>', new Date())
                .select('users.*', 'otps.otp', 'otps.expires_at')
                .first();
            return result;
        } catch (error) {
            console.error('Error finding user with OTP:', error);
            throw error;
        }
    }

    static async updateUserPassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await db('users')
                .where('id', userId)
                .update({
                    password: hashedPassword,
                    updated_at: db.fn.now()
                });
            return true;
        } catch (error) {
            console.error('Error updating user password:', error);
            throw error;
        }
    }
}

module.exports = AuthModel;