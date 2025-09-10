const AssignmentModel = require('./model');
const AssignmentNotificationService = require('./notificationService');
const { validationResult } = require('express-validator');

class AssignmentController {
    /**
     * Automatically assign a lead to the next available team member using round-robin
     * @param {number} organisationId - Organization ID
     * @param {number} leadId - Lead ID to assign
     * @param {number} assignedByUserId - User ID who triggered the assignment (system = 1)
     * @returns {Object} Assignment result
     */
    static async autoAssignLead(organisationId, leadId, assignedByUserId = 1) {
        try {
            // Get all team members for the organization
            const teamMembers = await AssignmentModel.getTeamMembersByOrganisation(organisationId);
            
            if (!teamMembers || teamMembers.length === 0) {
                return {
                    success: false,
                    message: 'No team members available for assignment',
                    data: null
                };
            }

            // Get the last assigned team member for round-robin
            const lastAssignment = await AssignmentModel.getLastAssignmentForOrganisation(organisationId);
            
            let nextAssigneeIndex = 0;
            if (lastAssignment && lastAssignment.assigned_user_id) {
                const lastAssigneeIndex = teamMembers.findIndex(member => member.id === lastAssignment.assigned_user_id);
                nextAssigneeIndex = (lastAssigneeIndex + 1) % teamMembers.length;
            }

            const assignedUser = teamMembers[nextAssigneeIndex];

            // Create the assignment
            const assignmentData = {
                organisation_id: organisationId,
                lead_id: leadId,
                assigned_user_id: assignedUser.id,
                assigned_by_user_id: assignedByUserId,
                notes: 'Auto-assigned via round-robin scheduling'
            };

            const assignment = await AssignmentModel.createAssignment(assignmentData);

            // Update the lead with assignment info
            await AssignmentModel.updateLeadAssignment(leadId, assignedUser.id);

            // Send notification to assigned user
            try {
                const leadData = await AssignmentModel.getLeadById(leadId, organisationId);
                const notificationService = new AssignmentNotificationService();
                await notificationService.notifyNewAssignment(
                    { ...assignmentData, id: assignment.insertId },
                    leadData,
                    assignedUser
                );
            } catch (notificationError) {
                console.error('Error sending assignment notification:', notificationError);
                // Don't fail the assignment if notification fails
            }

            return {
                success: true,
                message: 'Lead assigned successfully',
                data: {
                    assignment_id: assignment.insertId,
                    assigned_to: {
                        id: assignedUser.id,
                        name: assignedUser.name,
                        email: assignedUser.email
                    },
                    lead_id: leadId,
                    assigned_at: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('Auto assignment error:', error);
            return {
                success: false,
                message: 'Failed to assign lead automatically',
                error: error.message
            };
        }
    }

    /**
     * Manually assign a lead to a specific user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async assignLead(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { lead_id, assigned_user_id, notes, reassignment_reason } = req.body;
            const { organisation_id } = req.user; // From auth middleware
            const assigned_by_user_id = req.user.id;

            // Check if lead exists and belongs to organization
            const lead = await AssignmentModel.getLeadById(lead_id, organisation_id);
            if (!lead) {
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found or access denied'
                });
            }

            // Check if user exists and is a team member
            const assignee = await AssignmentModel.getUserById(assigned_user_id, organisation_id);
            if (!assignee) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignee not found or not a team member'
                });
            }

            // Get previous assignment if exists
            const previousAssignment = await AssignmentModel.getCurrentAssignment(lead_id);

            const assignmentData = {
                organisation_id,
                lead_id,
                assigned_user_id,
                assigned_by_user_id,
                previous_user_id: previousAssignment ? previousAssignment.assigned_user_id : null,
                reassignment_reason: reassignment_reason || null,
                notes: notes || 'Manual assignment'
            };

            const assignment = await AssignmentModel.createAssignment(assignmentData);
            await AssignmentModel.updateLeadAssignment(lead_id, assigned_user_id);

            // Send notification to assigned user
            try {
                const notificationService = new AssignmentNotificationService();
                await notificationService.notifyNewAssignment(
                    { ...assignmentData, id: assignment.insertId },
                    lead,
                    assignee
                );
            } catch (notificationError) {
                console.error('Error sending assignment notification:', notificationError);
                // Don't fail the assignment if notification fails
            }

            res.status(200).json({
                success: true,
                message: 'Lead assigned successfully',
                data: {
                    assignment_id: assignment.insertId,
                    lead_id,
                    assigned_to: {
                        id: assignee.id,
                        name: assignee.name,
                        email: assignee.email
                    },
                    previous_assignee: previousAssignment ? {
                        id: previousAssignment.assigned_user_id,
                        name: previousAssignment.assigned_user_name
                    } : null
                }
            });

        } catch (error) {
            console.error('Manual assignment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assign lead',
                error: error.message
            });
        }
    }

    /**
     * Get assignment history for a lead
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getLeadAssignmentHistory(req, res) {
        try {
            const { lead_id } = req.params;
            const { organisation_id } = req.user;

            const history = await AssignmentModel.getAssignmentHistory(lead_id, organisation_id);

            res.status(200).json({
                success: true,
                message: 'Assignment history retrieved successfully',
                data: history
            });

        } catch (error) {
            console.error('Get assignment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve assignment history',
                error: error.message
            });
        }
    }

    /**
     * Get all assignments for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getUserAssignments(req, res) {
        try {
            const { user_id } = req.params;
            const { organisation_id } = req.user;
            const { status, page = 1, limit = 20 } = req.query;

            const assignments = await AssignmentModel.getUserAssignments(
                user_id, 
                organisation_id, 
                status, 
                parseInt(page), 
                parseInt(limit)
            );

            res.status(200).json({
                success: true,
                message: 'User assignments retrieved successfully',
                data: assignments
            });

        } catch (error) {
            console.error('Get user assignments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user assignments',
                error: error.message
            });
        }
    }

    /**
     * Get assignment statistics for organization
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAssignmentStats(req, res) {
        try {
            const { organisation_id } = req.user;
            const { period = '30' } = req.query; // days

            const stats = await AssignmentModel.getAssignmentStats(organisation_id, parseInt(period));

            res.status(200).json({
                success: true,
                message: 'Assignment statistics retrieved successfully',
                data: stats
            });

        } catch (error) {
            console.error('Get assignment stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve assignment statistics',
                error: error.message
            });
        }
    }

    /**
     * Reassign multiple leads in bulk
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async bulkReassign(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { lead_ids, assigned_user_id, reassignment_reason, notes } = req.body;
            const { organisation_id } = req.user;
            const assigned_by_user_id = req.user.id;

            const results = [];
            const failedAssignments = [];

            for (const lead_id of lead_ids) {
                try {
                    // Check if lead exists
                    const lead = await AssignmentModel.getLeadById(lead_id, organisation_id);
                    if (!lead) {
                        errors.push({ lead_id, error: 'Lead not found' });
                        continue;
                    }

                    // Get previous assignment
                    const previousAssignment = await AssignmentModel.getCurrentAssignment(lead_id);

                    const assignmentData = {
                        organisation_id,
                        lead_id,
                        assigned_user_id,
                        assigned_by_user_id,
                        previous_user_id: previousAssignment ? previousAssignment.assigned_user_id : null,
                        reassignment_reason,
                        notes: notes || 'Bulk reassignment'
                    };

                    const assignment = await AssignmentModel.createAssignment(assignmentData);
                    await AssignmentModel.updateLeadAssignment(lead_id, assigned_user_id);

                    results.push({
                        lead_id,
                        assignment_id: assignment.insertId,
                        success: true
                    });

                } catch (error) {
                    errors.push({ lead_id, error: error.message });
                }
            }

            res.status(200).json({
                success: true,
                message: `Bulk reassignment completed. ${results.length} successful, ${errors.length} failed.`,
                data: {
                    successful: results,
                    failed: errors,
                    summary: {
                        total: lead_ids.length,
                        successful: results.length,
                        failed: errors.length
                    }
                }
            });

        } catch (error) {
            console.error('Bulk reassign error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to perform bulk reassignment',
                error: error.message
            });
        }
    }
}

module.exports = AssignmentController;