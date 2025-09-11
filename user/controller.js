const UserModel = require('./model');
const { generateRandomPassword } = require('../utils/password.utils');
const EmailUtils = require('../utils/email.utils');
const crypto = require('crypto');

class UserController {
    /**
     * Get all users with filtering and pagination
     * GET /users
     */
    static async getAllUsers(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                organisation_id,
                role_id,
                is_verified,
                unassigned
            } = req.query;

            const filters = {
                search,
                organisation_id,
                role_id,
                is_verified: is_verified !== undefined ? is_verified === 'true' : undefined,
                unassigned
            };

            // Remove undefined values
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await UserModel.getAllUsers(filters, parseInt(page), parseInt(limit));

            res.json({
                success: true,
                message: 'Users retrieved successfully',
                data: result.users,
                pagination: result.pagination
            });

        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get user by ID
     * GET /users/:id
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.getUserById(parseInt(id));

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });

        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get users by organization
     * GET /users/organisation/:organisationId
     */
    static async getUsersByOrganisation(req, res) {
        try {
            const { organisationId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const result = await UserModel.getUsersByOrganisation(
                parseInt(organisationId),
                parseInt(page),
                parseInt(limit)
            );

            res.json({
                success: true,
                message: 'Organization users retrieved successfully',
                data: result.users,
                pagination: result.pagination
            });

        } catch (error) {
            console.error('Get users by organisation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Create new user
     * POST /users
     */
    static async createUser(req, res) {
        try {
            const { name, email, phone, organisation_id, role_id, send_email = true } = req.body;

            // Validate required fields
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required'
                });
            }

            // Check if email already exists
            const emailExists = await UserModel.emailExists(email);
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Generate random password
            const password = generateRandomPassword();

            // Create user
            const userId = await UserModel.createUser({
                name,
                email,
                phone,
                password,
                organisation_id: organisation_id || null,
                role_id: role_id || null
            });

            // Send welcome email with credentials if requested
            if (send_email) {
                try {
                    await EmailUtils.sendWelcomeEmail(email, name, password);
                } catch (emailError) {
                    console.error('Failed to send welcome email:', emailError);
                    // Don't fail the user creation if email fails
                }
            }

            // Get created user details
            const createdUser = await UserModel.getUserById(userId);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    user: createdUser,
                    temporary_password: send_email ? undefined : password
                }
            });

        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Update user information
     * PUT /users/:id
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if user exists
            const existingUser = await UserModel.getUserById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check email uniqueness if email is being updated
            if (updateData.email && updateData.email !== existingUser.email) {
                const emailExists = await UserModel.emailExists(updateData.email, parseInt(id));
                if (emailExists) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }

            // Update user
            const success = await UserModel.updateUser(parseInt(id), updateData);
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            // Get updated user details
            const updatedUser = await UserModel.getUserById(parseInt(id));

            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Delete user (soft delete)
     * DELETE /users/:id
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await UserModel.getUserById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prevent deletion of superadmin
            if (existingUser.role_id === 1) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot delete superadmin user'
                });
            }

            // Soft delete user
            const success = await UserModel.deleteUser(parseInt(id));
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to delete user'
                });
            }

            res.json({
                success: true,
                message: 'User deleted successfully'
            });

        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Assign user to organization
     * POST /users/:id/assign-organisation
     */
    static async assignUserToOrganisation(req, res) {
        try {
            const { id } = req.params;
            const { organisation_id } = req.body;

            if (!organisation_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Organisation ID is required'
                });
            }

            // Check if user exists
            const existingUser = await UserModel.getUserById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Assign user to organisation
            const success = await UserModel.assignUserToOrganisation(parseInt(id), parseInt(organisation_id));
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to assign user to organisation'
                });
            }

            // Get updated user details
            const updatedUser = await UserModel.getUserById(parseInt(id));

            res.json({
                success: true,
                message: 'User assigned to organisation successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Assign user to organisation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Remove user from organization
     * DELETE /users/:id/remove-organisation
     */
    static async removeUserFromOrganisation(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await UserModel.getUserById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Remove user from organisation
            const success = await UserModel.removeUserFromOrganisation(parseInt(id));
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to remove user from organisation'
                });
            }

            // Get updated user details
            const updatedUser = await UserModel.getUserById(parseInt(id));

            res.json({
                success: true,
                message: 'User removed from organisation successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Remove user from organisation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Assign role to user
     * POST /users/:id/assign-role
     */
    static async assignRoleToUser(req, res) {
        try {
            const { id } = req.params;
            const { role_id } = req.body;

            if (!role_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Role ID is required'
                });
            }

            // Check if user exists
            const existingUser = await UserModel.getUserById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Assign role to user
            const success = await UserModel.assignRoleToUser(parseInt(id), parseInt(role_id));
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to assign role to user'
                });
            }

            // Get updated user details
            const updatedUser = await UserModel.getUserById(parseInt(id));

            res.json({
                success: true,
                message: 'Role assigned to user successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Assign role to user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Remove role from user
     * DELETE /users/:id/remove-role
     */
    static async removeRoleFromUser(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await UserModel.getUserById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prevent removing role from superadmin
            if (existingUser.role_id === 1) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot remove role from superadmin user'
                });
            }

            // Remove role from user
            const success = await UserModel.removeRoleFromUser(parseInt(id));
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to remove role from user'
                });
            }

            // Get updated user details
            const updatedUser = await UserModel.getUserById(parseInt(id));

            res.json({
                success: true,
                message: 'Role removed from user successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Remove role from user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Reset user password
     * POST /users/:id/reset-password
     */
    static async resetUserPassword(req, res) {
        try {
            const { id } = req.params;
            const { send_email = true } = req.body;

            // Check if user exists
            const existingUser = await UserModel.getUserById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate new password
            const newPassword = generateRandomPassword();

            // Reset password
            const success = await UserModel.resetUserPassword(parseInt(id), newPassword);
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to reset password'
                });
            }

            // Send password reset email if requested
            if (send_email) {
                try {
                    await EmailUtils.sendPasswordResetEmail(existingUser.email, existingUser.name, newPassword);
                } catch (emailError) {
                    console.error('Failed to send password reset email:', emailError);
                    // Don't fail the password reset if email fails
                }
            }

            res.json({
                success: true,
                message: 'Password reset successfully',
                data: {
                    temporary_password: send_email ? undefined : newPassword
                }
            });

        } catch (error) {
            console.error('Reset user password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get unassigned users
     * GET /users/unassigned
     */
    static async getUnassignedUsers(req, res) {
        try {
            const { page = 1, limit = 20 } = req.query;

            const result = await UserModel.getUnassignedUsers(parseInt(page), parseInt(limit));

            res.json({
                success: true,
                message: 'Unassigned users retrieved successfully',
                data: result.users,
                pagination: result.pagination
            });

        } catch (error) {
            console.error('Get unassigned users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get current user profile
     * GET /users/profile
     */
    static async getUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await UserModel.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User profile retrieved successfully',
                data: user
            });

        } catch (error) {
            console.error('Get user profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Update current user profile
     * PUT /users/profile
     */
    static async updateUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            // Only allow certain fields for self-update
            const allowedFields = ['name', 'phone'];
            const filteredData = {};
            
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = updateData[key];
                }
            });

            if (Object.keys(filteredData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            // Update user
            const success = await UserModel.updateUser(userId, filteredData);
            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update profile'
                });
            }

            // Get updated user details
            const updatedUser = await UserModel.getUserById(userId);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Update user profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Send user invitation
     * POST /users/invite
     */
    static async inviteUser(req, res) {
        try {
            const { email, organisation_id, role_id } = req.body;
            const invitedBy = req.user.id;

            // Validate required fields
            if (!email || !organisation_id || !role_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, organisation_id, and role_id are required'
                });
            }

            // Check if user already exists
            const existingUser = await UserModel.emailExists(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Generate invitation token and expiry (7 days)
            const invitationToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Create invitation
            const invitation = await UserModel.createInvitation({
                email,
                organisation_id,
                role_id,
                invited_by: invitedBy,
                invitation_token: invitationToken,
                expires_at: expiresAt
            });

            // Send invitation email
            const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${invitationToken}`;
            
            await EmailUtils.sendEmail({
                to: email,
                subject: 'You\'re invited to join LeadMagnate',
                html: `
                    <h2>You\'ve been invited to join LeadMagnate!</h2>
                    <p>Click the link below to accept your invitation and create your account:</p>
                    <a href="${invitationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                    <p>This invitation will expire in 7 days.</p>
                    <p>If you can't click the link, copy and paste this URL into your browser:</p>
                    <p>${invitationLink}</p>
                `
            });

            res.status(201).json({
                success: true,
                message: 'Invitation sent successfully',
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    expires_at: invitation.expires_at
                }
            });

        } catch (error) {
            console.error('Invite user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get invitation details by token
     * GET /users/invitation/:token
     */
    static async getInvitation(req, res) {
        try {
            const { token } = req.params;

            const invitation = await UserModel.getInvitationByToken(token);
            
            if (!invitation) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid or expired invitation'
                });
            }

            res.json({
                success: true,
                invitation: {
                    email: invitation.email,
                    organisation_name: invitation.organisation_name,
                    role_name: invitation.role_name,
                    invited_by_name: invitation.invited_by_name,
                    expires_at: invitation.expires_at
                }
            });

        } catch (error) {
            console.error('Get invitation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Accept invitation and create user account
     * POST /users/accept-invitation
     */
    static async acceptInvitation(req, res) {
        try {
            const { token, name, phone, password } = req.body;

            // Validate required fields
            if (!token || !name || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Token, name, and password are required'
                });
            }

            // Validate password strength
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters long'
                });
            }

            const user = await UserModel.acceptInvitation(token, {
                name,
                phone,
                password
            });

            res.status(201).json({
                success: true,
                message: 'Invitation accepted successfully. Account created.',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    organisation_id: user.organisation_id,
                    role_id: user.role_id
                }
            });

        } catch (error) {
            console.error('Accept invitation error:', error);
            
            if (error.message === 'Invalid or expired invitation' || 
                error.message === 'User with this email already exists') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get pending invitations for organization
     * GET /users/invitations
     */
    static async getPendingInvitations(req, res) {
        try {
            const organisationId = req.user.organisation_id;

            if (!organisationId) {
                return res.status(400).json({
                    success: false,
                    message: 'User must belong to an organization'
                });
            }

            const invitations = await UserModel.getPendingInvitations(organisationId);

            res.json({
                success: true,
                invitations
            });

        } catch (error) {
            console.error('Get pending invitations error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Cancel invitation
     * DELETE /users/invitations/:id
     */
    static async cancelInvitation(req, res) {
        try {
            const { id } = req.params;

            const success = await UserModel.cancelInvitation(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Invitation not found or already processed'
                });
            }

            res.json({
                success: true,
                message: 'Invitation cancelled successfully'
            });

        } catch (error) {
            console.error('Cancel invitation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Resend invitation
     * POST /users/invitations/:id/resend
     */
    static async resendInvitation(req, res) {
        try {
            const { id } = req.params;

            // Generate new token and expiry
            const newToken = crypto.randomBytes(32).toString('hex');
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + 7);

            const success = await UserModel.resendInvitation(id, newToken, newExpiry);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Invitation not found or already processed'
                });
            }

            // Get updated invitation details for email
            const invitation = await UserModel.getInvitationByToken(newToken);
            
            if (invitation) {
                // Send new invitation email
                const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${newToken}`;
                
                await EmailUtils.sendEmail({
                    to: invitation.email,
                    subject: 'Invitation Reminder - Join LeadMagnate',
                    html: `
                        <h2>Reminder: You\'ve been invited to join LeadMagnate!</h2>
                        <p>Click the link below to accept your invitation and create your account:</p>
                        <a href="${invitationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                        <p>This invitation will expire in 7 days.</p>
                        <p>If you can't click the link, copy and paste this URL into your browser:</p>
                        <p>${invitationLink}</p>
                    `
                });
            }

            res.json({
                success: true,
                message: 'Invitation resent successfully'
            });

        } catch (error) {
            console.error('Resend invitation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = UserController;