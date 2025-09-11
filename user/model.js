const { db } = require('../config/dbConfig');
const bcrypt = require('bcryptjs');

class UserModel {
    /**
     * Get all users with optional filtering and pagination
     * @param {Object} filters - Filter options
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Object} Paginated users list
     */
    static async getAllUsers(filters = {}, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        let query = db('users')
            .select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.is_verified',
                'users.created_at',
                'users.updated_at',
                'organisations.id as organisation_id',
                'organisations.name as organisation_name',
                'roles.id as role_id',
                'roles.name as role_name'
            )
            .leftJoin('organisations', 'users.organisation_id', 'organisations.id')
            .leftJoin('roles', 'users.role_id', 'roles.id')
            .where('users.deleted_at', null); // Exclude soft deleted users

        // Apply filters
        if (filters.search) {
            query = query.where(function() {
                this.where('users.name', 'like', `%${filters.search}%`)
                    .orWhere('users.email', 'like', `%${filters.search}%`);
            });
        }

        if (filters.organisation_id) {
            query = query.where('users.organisation_id', filters.organisation_id);
        }

        if (filters.role_id) {
            query = query.where('users.role_id', filters.role_id);
        }

        if (filters.is_verified !== undefined) {
            query = query.where('users.is_verified', filters.is_verified);
        }

        if (filters.unassigned === 'true') {
            query = query.whereNull('users.organisation_id');
        }

        // Get total count for pagination
        const countQuery = query.clone();
        const totalCount = await countQuery.count('users.id as count').first();
        const total = parseInt(totalCount.count);

        // Apply pagination and sorting
        const users = await query
            .orderBy('users.created_at', 'desc')
            .limit(limit)
            .offset(offset);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user by ID with organization and role details
     * @param {number} userId - User ID
     * @returns {Object|null} User details
     */
    static async getUserById(userId) {
        return await db('users')
            .select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.is_verified',
                'users.created_at',
                'users.updated_at',
                'organisations.id as organisation_id',
                'organisations.name as organisation_name',
                'roles.id as role_id',
                'roles.name as role_name'
            )
            .leftJoin('organisations', 'users.organisation_id', 'organisations.id')
            .leftJoin('roles', 'users.role_id', 'roles.id')
            .where('users.id', userId)
            .whereNull('users.deleted_at')
            .first();
    }

    /**
     * Get users by organization ID
     * @param {number} organisationId - Organization ID
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Object} Paginated users list
     */
    static async getUsersByOrganisation(organisationId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const users = await db('users')
            .select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.is_verified',
                'users.created_at',
                'roles.id as role_id',
                'roles.name as role_name'
            )
            .leftJoin('roles', 'users.role_id', 'roles.id')
            .where('users.organisation_id', organisationId)
            .whereNull('users.deleted_at')
            .orderBy('users.created_at', 'desc')
            .limit(limit)
            .offset(offset);

        const totalCount = await db('users')
            .where('organisation_id', organisationId)
            .whereNull('deleted_at')
            .count('id as count')
            .first();

        const total = parseInt(totalCount.count);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Create new user
     * @param {Object} userData - User data
     * @returns {number} New user ID
     */
    static async createUser(userData) {
        const { name, email, phone, password, organisation_id = null, role_id = null } = userData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [userId] = await db('users').insert({
            name,
            email,
            phone,
            password: hashedPassword,
            organisation_id,
            role_id,
            is_verified: 1, // Admin created users are auto-verified
            created_at: new Date(),
            updated_at: new Date()
        });

        return userId;
    }

    /**
     * Update user information
     * @param {number} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {boolean} Success status
     */
    static async updateUser(userId, updateData) {
        const allowedFields = ['name', 'email', 'phone', 'is_verified'];
        const filteredData = {};
        
        // Only allow specific fields to be updated
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        if (Object.keys(filteredData).length === 0) {
            return false;
        }

        filteredData.updated_at = new Date();

        const result = await db('users')
            .where('id', userId)
            .whereNull('deleted_at')
            .update(filteredData);

        return result > 0;
    }

    /**
     * Assign user to organization
     * @param {number} userId - User ID
     * @param {number} organisationId - Organization ID
     * @returns {boolean} Success status
     */
    static async assignUserToOrganisation(userId, organisationId) {
        const result = await db('users')
            .where('id', userId)
            .whereNull('deleted_at')
            .update({
                organisation_id: organisationId,
                updated_at: new Date()
            });

        return result > 0;
    }

    /**
     * Remove user from organization
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async removeUserFromOrganisation(userId) {
        const result = await db('users')
            .where('id', userId)
            .whereNull('deleted_at')
            .update({
                organisation_id: null,
                role_id: null, // Remove role when removing from org
                updated_at: new Date()
            });

        return result > 0;
    }

    /**
     * Assign role to user
     * @param {number} userId - User ID
     * @param {number} roleId - Role ID
     * @returns {boolean} Success status
     */
    static async assignRoleToUser(userId, roleId) {
        const result = await db('users')
            .where('id', userId)
            .whereNull('deleted_at')
            .update({
                role_id: roleId,
                updated_at: new Date()
            });

        return result > 0;
    }

    /**
     * Remove role from user
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async removeRoleFromUser(userId) {
        const result = await db('users')
            .where('id', userId)
            .whereNull('deleted_at')
            .update({
                role_id: null,
                updated_at: new Date()
            });

        return result > 0;
    }

    /**
     * Soft delete user
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async deleteUser(userId) {
        const result = await db('users')
            .where('id', userId)
            .whereNull('deleted_at')
            .update({
                deleted_at: new Date(),
                updated_at: new Date()
            });

        return result > 0;
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @param {number} excludeUserId - User ID to exclude from check
     * @returns {boolean} Email exists
     */
    static async emailExists(email, excludeUserId = null) {
        let query = db('users')
            .where('email', email)
            .whereNull('deleted_at');

        if (excludeUserId) {
            query = query.where('id', '!=', excludeUserId);
        }

        const user = await query.first();
        return !!user;
    }

    /**
     * Reset user password
     * @param {number} userId - User ID
     * @param {string} newPassword - New password
     * @returns {boolean} Success status
     */
    static async resetUserPassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        const result = await db('users')
            .where('id', userId)
            .whereNull('deleted_at')
            .update({
                password: hashedPassword,
                updated_at: new Date()
            });

        return result > 0;
    }

    /**
     * Get unassigned users (users without organisation)
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Object} Paginated unassigned users list
     */
    static async getUnassignedUsers(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        try {
            const users = await db('users')
                .select(
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.phone',
                    'users.is_verified',
                    'users.created_at',
                    'roles.id as role_id',
                    'roles.name as role_name'
                )
                .leftJoin('roles', 'users.role_id', 'roles.id')
                .whereNull('users.organisation_id')
                .where('users.deleted_at', null)
                .orderBy('users.created_at', 'desc')
                .limit(limit)
                .offset(offset);

            const totalCount = await db('users')
                .whereNull('organisation_id')
                .where('deleted_at', null)
                .count('id as count')
                .first();

            return {
                users,
                pagination: {
                    page,
                    limit,
                    total: totalCount.count,
                    totalPages: Math.ceil(totalCount.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create user invitation
     * @param {Object} invitationData - Invitation details
     * @returns {Object} Created invitation
     */
    static async createInvitation(invitationData) {
        try {
            const invitation = {
                email: invitationData.email,
                organisation_id: invitationData.organisation_id,
                role_id: invitationData.role_id,
                invited_by: invitationData.invited_by,
                invitation_token: invitationData.invitation_token,
                expires_at: invitationData.expires_at,
                status: 'pending',
                created_at: new Date(),
                updated_at: new Date()
            };

            const [invitationId] = await db('user_invitations').insert(invitation);
            return { id: invitationId, ...invitation };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get invitation by token
     * @param {string} token - Invitation token
     * @returns {Object} Invitation details
     */
    static async getInvitationByToken(token) {
        try {
            const invitation = await db('user_invitations')
                .select(
                    'user_invitations.*',
                    'organisations.name as organisation_name',
                    'roles.name as role_name',
                    'users.name as invited_by_name'
                )
                .leftJoin('organisations', 'user_invitations.organisation_id', 'organisations.id')
                .leftJoin('roles', 'user_invitations.role_id', 'roles.id')
                .leftJoin('users', 'user_invitations.invited_by', 'users.id')
                .where('user_invitations.invitation_token', token)
                .where('user_invitations.status', 'pending')
                .where('user_invitations.expires_at', '>', new Date())
                .first();

            return invitation;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Accept invitation and create user
     * @param {string} token - Invitation token
     * @param {Object} userData - User registration data
     * @returns {Object} Created user
     */
    static async acceptInvitation(token, userData) {
        const trx = await db.transaction();
        
        try {
            // Get invitation details
            const invitation = await trx('user_invitations')
                .where('invitation_token', token)
                .where('status', 'pending')
                .where('expires_at', '>', new Date())
                .first();

            if (!invitation) {
                throw new Error('Invalid or expired invitation');
            }

            // Check if email already exists
            const existingUser = await trx('users')
                .where('email', invitation.email)
                .where('deleted_at', null)
                .first();

            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 12);

            // Create user
            const newUser = {
                name: userData.name,
                email: invitation.email,
                phone: userData.phone,
                password: hashedPassword,
                organisation_id: invitation.organisation_id,
                role_id: invitation.role_id,
                is_verified: true, // Auto-verify invited users
                created_at: new Date(),
                updated_at: new Date()
            };

            const [userId] = await trx('users').insert(newUser);

            // Update invitation status
            await trx('user_invitations')
                .where('id', invitation.id)
                .update({
                    status: 'accepted',
                    accepted_at: new Date(),
                    updated_at: new Date()
                });

            await trx.commit();

            // Return user without password
            const { password, ...userWithoutPassword } = newUser;
            return { id: userId, ...userWithoutPassword };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    /**
     * Get pending invitations for an organization
     * @param {number} organisationId - Organization ID
     * @returns {Array} Pending invitations
     */
    static async getPendingInvitations(organisationId) {
        try {
            const invitations = await db('user_invitations')
                .select(
                    'user_invitations.*',
                    'roles.name as role_name',
                    'users.name as invited_by_name'
                )
                .leftJoin('roles', 'user_invitations.role_id', 'roles.id')
                .leftJoin('users', 'user_invitations.invited_by', 'users.id')
                .where('user_invitations.organisation_id', organisationId)
                .where('user_invitations.status', 'pending')
                .where('user_invitations.expires_at', '>', new Date())
                .orderBy('user_invitations.created_at', 'desc');

            return invitations;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cancel invitation
     * @param {number} invitationId - Invitation ID
     * @returns {boolean} Success status
     */
    static async cancelInvitation(invitationId) {
        try {
            const result = await db('user_invitations')
                .where('id', invitationId)
                .where('status', 'pending')
                .update({
                    status: 'cancelled',
                    updated_at: new Date()
                });

            return result > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Resend invitation (update expiry and generate new token)
     * @param {number} invitationId - Invitation ID
     * @param {string} newToken - New invitation token
     * @param {Date} newExpiry - New expiry date
     * @returns {boolean} Success status
     */
    static async resendInvitation(invitationId, newToken, newExpiry) {
        try {
            const result = await db('user_invitations')
                .where('id', invitationId)
                .where('status', 'pending')
                .update({
                    invitation_token: newToken,
                    expires_at: newExpiry,
                    updated_at: new Date()
                });

            return result > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserModel;