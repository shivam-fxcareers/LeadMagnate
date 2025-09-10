const AssignmentModel = require('./model');

class AssignmentStatusManager {
    /**
     * Update assignment status
     * @param {number} assignmentId - Assignment ID
     * @param {string} newStatus - New status (active, completed, cancelled, reassigned)
     * @param {number} updatedBy - User ID who updated the status
     * @param {string} reason - Reason for status change
     */
    static async updateAssignmentStatus(assignmentId, newStatus, updatedBy, reason = null) {
        try {
            const validStatuses = ['active', 'completed', 'cancelled', 'reassigned'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error(`Invalid status: ${newStatus}. Valid statuses are: ${validStatuses.join(', ')}`);
            }

            // Get current assignment
            const assignment = await AssignmentModel.getAssignmentById(assignmentId);
            if (!assignment) {
                throw new Error('Assignment not found');
            }

            const oldStatus = assignment.status;
            
            // Update assignment status
            await AssignmentModel.updateAssignmentStatus(assignmentId, newStatus, updatedBy);
            
            // Log status change in history
            await AssignmentModel.logStatusChange({
                assignment_id: assignmentId,
                old_status: oldStatus,
                new_status: newStatus,
                changed_by: updatedBy,
                reason: reason,
                changed_at: new Date()
            });

            console.log(`Assignment ${assignmentId} status updated from ${oldStatus} to ${newStatus}`);
            
            return {
                success: true,
                assignment_id: assignmentId,
                old_status: oldStatus,
                new_status: newStatus
            };
        } catch (error) {
            console.error('Error updating assignment status:', error);
            throw error;
        }
    }

    /**
     * Reassign lead to a different team member
     * @param {number} leadMetaId - Lead meta ID
     * @param {number} newUserId - New user ID to assign to
     * @param {number} reassignedBy - User ID who performed the reassignment
     * @param {string} reason - Reason for reassignment
     */
    static async reassignLead(leadMetaId, newUserId, reassignedBy, reason = null) {
        try {
            // Get current active assignment
            const currentAssignment = await AssignmentModel.getActiveAssignmentByLead(leadMetaId);
            if (!currentAssignment) {
                throw new Error('No active assignment found for this lead');
            }

            // Validate new user exists and is a team member
            const newUser = await AssignmentModel.getUserById(newUserId);
            if (!newUser || newUser.role !== 'team_member') {
                throw new Error('Invalid user or user is not a team member');
            }

            // Mark current assignment as reassigned
            await this.updateAssignmentStatus(
                currentAssignment.id, 
                'reassigned', 
                reassignedBy, 
                reason || 'Manual reassignment'
            );

            // Create new assignment
            const newAssignmentData = {
                lead_meta_id: leadMetaId,
                assigned_to: newUserId,
                assigned_by: reassignedBy,
                status: 'active',
                assigned_at: new Date(),
                organisation_id: currentAssignment.organisation_id
            };

            const newAssignmentId = await AssignmentModel.createAssignment(newAssignmentData);
            
            console.log(`Lead ${leadMetaId} reassigned from user ${currentAssignment.assigned_to} to user ${newUserId}`);
            
            return {
                success: true,
                old_assignment_id: currentAssignment.id,
                new_assignment_id: newAssignmentId,
                lead_meta_id: leadMetaId,
                old_user_id: currentAssignment.assigned_to,
                new_user_id: newUserId
            };
        } catch (error) {
            console.error('Error reassigning lead:', error);
            throw error;
        }
    }

    /**
     * Get assignment status history
     * @param {number} assignmentId - Assignment ID
     */
    static async getAssignmentStatusHistory(assignmentId) {
        try {
            const history = await AssignmentModel.getAssignmentStatusHistory(assignmentId);
            return {
                success: true,
                assignment_id: assignmentId,
                history: history
            };
        } catch (error) {
            console.error('Error fetching assignment status history:', error);
            throw error;
        }
    }

    /**
     * Get assignments by status
     * @param {string} status - Status to filter by
     * @param {number} organisationId - Organisation ID
     * @param {number} limit - Limit results
     * @param {number} offset - Offset for pagination
     */
    static async getAssignmentsByStatus(status, organisationId, limit = 50, offset = 0) {
        try {
            const assignments = await AssignmentModel.getAssignmentsByStatus(
                status, 
                organisationId, 
                limit, 
                offset
            );
            
            return {
                success: true,
                status: status,
                organisation_id: organisationId,
                assignments: assignments,
                pagination: {
                    limit: limit,
                    offset: offset
                }
            };
        } catch (error) {
            console.error('Error fetching assignments by status:', error);
            throw error;
        }
    }

    /**
     * Get overdue assignments (active assignments older than specified days)
     * @param {number} organisationId - Organisation ID
     * @param {number} daysOverdue - Number of days to consider overdue (default: 7)
     */
    static async getOverdueAssignments(organisationId, daysOverdue = 7) {
        try {
            const overdueDate = new Date();
            overdueDate.setDate(overdueDate.getDate() - daysOverdue);
            
            const assignments = await AssignmentModel.getOverdueAssignments(organisationId, overdueDate);
            
            return {
                success: true,
                organisation_id: organisationId,
                days_overdue: daysOverdue,
                overdue_assignments: assignments
            };
        } catch (error) {
            console.error('Error fetching overdue assignments:', error);
            throw error;
        }
    }

    /**
     * Auto-complete assignments based on lead status
     * @param {number} leadMetaId - Lead meta ID
     * @param {string} leadStatus - Lead status (converted, closed, etc.)
     * @param {number} completedBy - User ID who completed the assignment
     */
    static async autoCompleteAssignment(leadMetaId, leadStatus, completedBy) {
        try {
            const completionStatuses = ['converted', 'closed', 'won', 'lost'];
            
            if (completionStatuses.includes(leadStatus.toLowerCase())) {
                const activeAssignment = await AssignmentModel.getActiveAssignmentByLead(leadMetaId);
                
                if (activeAssignment) {
                    await this.updateAssignmentStatus(
                        activeAssignment.id,
                        'completed',
                        completedBy,
                        `Auto-completed due to lead status: ${leadStatus}`
                    );
                    
                    console.log(`Auto-completed assignment ${activeAssignment.id} for lead ${leadMetaId}`);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error auto-completing assignment:', error);
            throw error;
        }
    }
}

module.exports = AssignmentStatusManager;