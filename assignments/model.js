const db = require('../config/dbConfig');

class AssignmentModel {
    /**
     * Get all team members for an organization
     * @param {number} organisationId - Organization ID
     * @returns {Array} Array of team members
     */
    static async getTeamMembersByOrganisation(organisationId) {
        const query = `
            SELECT u.id, u.name, u.email, u.phone, u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.organisation_id = ? 
            AND r.name = 'team_member'
            AND u.is_verified = 1
            ORDER BY u.created_at ASC
        `;
        
        try {
            const [rows] = await db.execute(query, [organisationId]);
            return rows;
        } catch (error) {
            console.error('Error fetching team members:', error);
            throw error;
        }
    }

    /**
     * Get the last assignment for round-robin scheduling
     * @param {number} organisationId - Organization ID
     * @returns {Object|null} Last assignment record
     */
    static async getLastAssignmentForOrganisation(organisationId) {
        const query = `
            SELECT assigned_user_id, assigned_at
            FROM lead_assignments
            WHERE organisation_id = ?
            ORDER BY assigned_at DESC
            LIMIT 1
        `;
        
        try {
            const [rows] = await db.execute(query, [organisationId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching last assignment:', error);
            throw error;
        }
    }

    /**
     * Create a new lead assignment
     * @param {Object} assignmentData - Assignment data
     * @returns {Object} Insert result
     */
    static async createAssignment(assignmentData) {
        const {
            organisation_id,
            lead_id,
            assigned_user_id,
            assigned_by_user_id,
            previous_user_id = null,
            reassignment_reason = null,
            notes = null
        } = assignmentData;

        const query = `
            INSERT INTO lead_assignments (
                organisation_id, lead_id, assigned_user_id, assigned_by_user_id,
                previous_user_id, reassignment_reason, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [
                organisation_id, lead_id, assigned_user_id, assigned_by_user_id,
                previous_user_id, reassignment_reason, notes
            ]);
            return result;
        } catch (error) {
            console.error('Error creating assignment:', error);
            throw error;
        }
    }

    /**
     * Update lead with assignment information
     * @param {number} leadId - Lead ID
     * @param {number} assignedUserId - Assigned user ID
     * @returns {Object} Update result
     */
    static async updateLeadAssignment(leadId, assignedUserId) {
        const query = `
            UPDATE lead_data 
            SET assigned_user_id = ?, assigned_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        try {
            const [result] = await db.execute(query, [assignedUserId, leadId]);
            return result;
        } catch (error) {
            console.error('Error updating lead assignment:', error);
            throw error;
        }
    }

    /**
     * Get lead by ID and organization
     * @param {number} leadId - Lead ID
     * @param {number} organisationId - Organization ID
     * @returns {Object|null} Lead record
     */
    static async getLeadById(leadId, organisationId) {
        const query = `
            SELECT ld.*, lm.utm_source, lm.utm_campaign, lm.platform_key
            FROM lead_data ld
            JOIN lead_meta lm ON ld.lead_meta_id = lm.id
            WHERE ld.id = ? AND ld.organisation_id = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [leadId, organisationId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching lead:', error);
            throw error;
        }
    }

    /**
     * Get user by ID and organization (team member check)
     * @param {number} userId - User ID
     * @param {number} organisationId - Organization ID
     * @returns {Object|null} User record
     */
    static async getUserById(userId, organisationId) {
        const query = `
            SELECT u.id, u.name, u.email, u.phone, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ? AND u.organisation_id = ? AND r.name = 'team_member'
        `;
        
        try {
            const [rows] = await db.execute(query, [userId, organisationId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    /**
     * Get current assignment for a lead
     * @param {number} leadId - Lead ID
     * @returns {Object|null} Current assignment
     */
    static async getCurrentAssignment(leadId) {
        const query = `
            SELECT la.*, u.name as assigned_user_name, u.email as assigned_user_email
            FROM lead_assignments la
            LEFT JOIN users u ON la.assigned_user_id = u.id
            WHERE la.lead_id = ?
            ORDER BY la.assigned_at DESC
            LIMIT 1
        `;
        
        try {
            const [rows] = await db.execute(query, [leadId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching current assignment:', error);
            throw error;
        }
    }

    /**
     * Get assignment history for a lead
     * @param {number} leadId - Lead ID
     * @param {number} organisationId - Organization ID
     * @returns {Array} Assignment history
     */
    static async getAssignmentHistory(leadId, organisationId) {
        const query = `
            SELECT 
                la.*,
                u1.name as assigned_user_name,
                u1.email as assigned_user_email,
                u2.name as assigned_by_name,
                u2.email as assigned_by_email,
                u3.name as previous_user_name,
                u3.email as previous_user_email
            FROM lead_assignments la
            LEFT JOIN users u1 ON la.assigned_user_id = u1.id
            LEFT JOIN users u2 ON la.assigned_by_user_id = u2.id
            LEFT JOIN users u3 ON la.previous_user_id = u3.id
            WHERE la.lead_id = ? AND la.organisation_id = ?
            ORDER BY la.assigned_at DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [leadId, organisationId]);
            return rows;
        } catch (error) {
            console.error('Error fetching assignment history:', error);
            throw error;
        }
    }

    /**
     * Get assignments for a specific user
     * @param {number} userId - User ID
     * @param {number} organisationId - Organization ID
     * @param {string} status - Lead status filter
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Object} Paginated assignments
     */
    static async getUserAssignments(userId, organisationId, status = null, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE ld.assigned_user_id = ? AND ld.organisation_id = ?';
        let queryParams = [userId, organisationId];
        
        if (status) {
            whereClause += ' AND ld.status = ?';
            queryParams.push(status);
        }

        const query = `
            SELECT 
                ld.*,
                lm.utm_source,
                lm.utm_campaign,
                lm.platform_key,
                la.assigned_at,
                la.notes as assignment_notes
            FROM lead_data ld
            JOIN lead_meta lm ON ld.lead_meta_id = lm.id
            LEFT JOIN lead_assignments la ON ld.id = la.lead_id 
                AND la.assigned_at = (
                    SELECT MAX(assigned_at) 
                    FROM lead_assignments 
                    WHERE lead_id = ld.id
                )
            ${whereClause}
            ORDER BY la.assigned_at DESC
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM lead_data ld
            ${whereClause}
        `;
        
        try {
            const [rows] = await db.execute(query, [...queryParams, limit, offset]);
            const [countResult] = await db.execute(countQuery, queryParams);
            
            return {
                assignments: rows,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: countResult[0].total,
                    total_pages: Math.ceil(countResult[0].total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching user assignments:', error);
            throw error;
        }
    }

    /**
     * Get assignment statistics for organization
     * @param {number} organisationId - Organization ID
     * @param {number} days - Number of days to look back
     * @returns {Object} Assignment statistics
     */
    static async getAssignmentStats(organisationId, days = 30) {
        const queries = {
            totalAssignments: `
                SELECT COUNT(*) as total
                FROM lead_assignments
                WHERE organisation_id = ? 
                AND assigned_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            `,
            assignmentsByUser: `
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    COUNT(la.id) as assignment_count,
                    COUNT(CASE WHEN ld.status IN ('won', 'qualified') THEN 1 END) as successful_leads
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN lead_assignments la ON u.id = la.assigned_user_id 
                    AND la.assigned_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                LEFT JOIN lead_data ld ON la.lead_id = ld.id
                WHERE u.organisation_id = ? AND r.name = 'team_member'
                GROUP BY u.id, u.name, u.email
                ORDER BY assignment_count DESC
            `,
            dailyAssignments: `
                SELECT 
                    DATE(assigned_at) as assignment_date,
                    COUNT(*) as assignments_count
                FROM lead_assignments
                WHERE organisation_id = ? 
                AND assigned_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE(assigned_at)
                ORDER BY assignment_date DESC
            `,
            leadStatusDistribution: `
                SELECT 
                    ld.status,
                    COUNT(*) as count
                FROM lead_data ld
                JOIN lead_assignments la ON ld.id = la.lead_id
                WHERE ld.organisation_id = ? 
                AND la.assigned_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY ld.status
                ORDER BY count DESC
            `
        };
        
        try {
            const [totalResult] = await db.execute(queries.totalAssignments, [organisationId, days]);
            const [userResult] = await db.execute(queries.assignmentsByUser, [days, organisationId]);
            const [dailyResult] = await db.execute(queries.dailyAssignments, [organisationId, days]);
            const [statusResult] = await db.execute(queries.leadStatusDistribution, [organisationId, days]);
            
            return {
                period_days: days,
                total_assignments: totalResult[0].total,
                assignments_by_user: userResult,
                daily_assignments: dailyResult,
                lead_status_distribution: statusResult,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching assignment stats:', error);
            throw error;
        }
    }

    /**
     * Check if a lead is already assigned
     * @param {number} leadId - Lead ID
     * @returns {boolean} True if assigned
     */
    static async isLeadAssigned(leadId) {
        const query = `
            SELECT assigned_user_id
            FROM lead_data
            WHERE id = ? AND assigned_user_id IS NOT NULL
        `;
        
        try {
            const [rows] = await db.execute(query, [leadId]);
            return rows.length > 0 && rows[0].assigned_user_id !== null;
        } catch (error) {
            console.error('Error checking lead assignment:', error);
            throw error;
        }
    }

    /**
     * Get team member workload (number of active assignments)
     * @param {number} organisationId - Organization ID
     * @returns {Array} Team member workloads
     */
    static async getTeamMemberWorkload(organisationId) {
        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                COUNT(ld.id) as active_leads,
                COUNT(CASE WHEN ld.status = 'new' THEN 1 END) as new_leads,
                COUNT(CASE WHEN ld.status IN ('qualified', 'contacted') THEN 1 END) as active_leads_in_progress
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN lead_data ld ON u.id = ld.assigned_user_id 
                AND ld.status NOT IN ('won', 'lost')
            WHERE u.organisation_id = ? AND r.name = 'team_member'
            GROUP BY u.id, u.name, u.email
            ORDER BY active_leads ASC
        `;
        
        try {
            const [rows] = await db.execute(query, [organisationId]);
            return rows;
        } catch (error) {
            console.error('Error fetching team member workload:', error);
            throw error;
        }
    }

    /**
     * Get assignment by ID
     * @param {number} assignmentId - Assignment ID
     */
    static async getAssignmentById(assignmentId) {
        try {
            const query = `
                SELECT la.*, lm.organisation_id, u.name as assigned_to_name, u.email as assigned_to_email
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                JOIN users u ON la.assigned_to = u.id
                WHERE la.id = ?
            `;
            
            const [rows] = await db.execute(query, [assignmentId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting assignment by ID:', error);
            throw error;
        }
    }

    /**
     * Update assignment status
     * @param {number} assignmentId - Assignment ID
     * @param {string} status - New status
     * @param {number} updatedBy - User ID who updated
     */
    static async updateAssignmentStatus(assignmentId, status, updatedBy) {
        try {
            const query = `
                UPDATE lead_assignments 
                SET status = ?, updated_at = NOW(), updated_by = ?
                WHERE id = ?
            `;
            
            await db.execute(query, [status, updatedBy, assignmentId]);
            return true;
        } catch (error) {
            console.error('Error updating assignment status:', error);
            throw error;
        }
    }

    /**
     * Log status change in history
     * @param {Object} changeData - Status change data
     */
    static async logStatusChange(changeData) {
        try {
            const query = `
                INSERT INTO assignment_status_history 
                (assignment_id, old_status, new_status, changed_by, reason, changed_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            await db.execute(query, [
                changeData.assignment_id,
                changeData.old_status,
                changeData.new_status,
                changeData.changed_by,
                changeData.reason,
                changeData.changed_at
            ]);
            return true;
        } catch (error) {
            console.error('Error logging status change:', error);
            throw error;
        }
    }

    /**
     * Get active assignment by lead
     * @param {number} leadMetaId - Lead meta ID
     */
    static async getActiveAssignmentByLead(leadMetaId) {
        try {
            const query = `
                SELECT la.*, u.name as assigned_to_name, u.email as assigned_to_email
                FROM lead_assignments la
                JOIN users u ON la.assigned_to = u.id
                WHERE la.lead_meta_id = ? AND la.status = 'active'
                ORDER BY la.assigned_at DESC
                LIMIT 1
            `;
            
            const [rows] = await db.execute(query, [leadMetaId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting active assignment by lead:', error);
            throw error;
        }
    }

    /**
     * Get assignment status history
     * @param {number} assignmentId - Assignment ID
     */
    static async getAssignmentStatusHistory(assignmentId) {
        try {
            const query = `
                SELECT ash.*, u.name as changed_by_name
                FROM assignment_status_history ash
                LEFT JOIN users u ON ash.changed_by = u.id
                WHERE ash.assignment_id = ?
                ORDER BY ash.changed_at DESC
            `;
            
            const [rows] = await db.execute(query, [assignmentId]);
            return rows;
        } catch (error) {
            console.error('Error getting assignment status history:', error);
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
    static async getAssignmentsByStatus(status, organisationId, limit, offset) {
        try {
            const query = `
                SELECT la.*, lm.source_lead_id, lm.platform_key, 
                       u.name as assigned_to_name, u.email as assigned_to_email,
                       ld.name as lead_name, ld.email as lead_email
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                JOIN users u ON la.assigned_to = u.id
                LEFT JOIN lead_data ld ON lm.id = ld.lead_meta_id
                WHERE la.status = ? AND lm.organisation_id = ?
                ORDER BY la.assigned_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const [rows] = await db.execute(query, [status, organisationId, limit, offset]);
            return rows;
        } catch (error) {
            console.error('Error getting assignments by status:', error);
            throw error;
        }
    }

    /**
     * Get overdue assignments
     * @param {number} organisationId - Organisation ID
     * @param {Date} overdueDate - Date to consider overdue
     */
    static async getOverdueAssignments(organisationId, overdueDate) {
        try {
            const query = `
                SELECT la.*, lm.source_lead_id, lm.platform_key,
                       u.name as assigned_to_name, u.email as assigned_to_email,
                       ld.name as lead_name, ld.email as lead_email,
                       DATEDIFF(NOW(), la.assigned_at) as days_overdue
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                JOIN users u ON la.assigned_to = u.id
                LEFT JOIN lead_data ld ON lm.id = ld.lead_meta_id
                WHERE la.status = 'active' 
                  AND lm.organisation_id = ? 
                  AND la.assigned_at < ?
                ORDER BY la.assigned_at ASC
            `;
            
            const [rows] = await db.execute(query, [organisationId, overdueDate]);
            return rows;
        } catch (error) {
            console.error('Error getting overdue assignments:', error);
            throw error;
        }
    }
}

module.exports = AssignmentModel;