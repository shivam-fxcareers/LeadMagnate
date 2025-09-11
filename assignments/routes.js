const express = require('express');
const AssignmentController = require('./controller');
const AssignmentAnalytics = require('./analytics');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * Assignment Routes
 * All routes require authentication
 */

/**
 * POST /api/assignments/auto-assign
 * Auto-assign a lead to a team member using round-robin
 */
router.post('/auto-assign', 
    authenticateToken,
    
    AssignmentController.assignLead
);

/**
 * POST /api/assignments/manual-assign
 * Manually assign a lead to a specific team member
 */
router.post('/manual-assign',
    authenticateToken,
    AssignmentController.assignLead
);

/**
 * GET /api/assignments/history/:leadId
 * Get assignment history for a specific lead
 */
router.get('/history/:leadId',
    authenticateToken,
    AssignmentController.getLeadAssignmentHistory
);

/**
 * GET /api/assignments/user/:userId
 * Get all assignments for a specific user
 */
router.get('/user/:userId',
    authenticateToken,
    AssignmentController.getUserAssignments
);

/**
 * GET /api/assignments/organisation/:orgId
 * Get assignment statistics for an organisation
 */
router.get('/organisation/:orgId',
    authenticateToken,
    AssignmentController.getAssignmentStats
);

/**
 * PUT /api/assignments/reassign
 * Reassign leads in bulk
 */
router.put('/reassign',
    authenticateToken,
    AssignmentController.bulkReassign
);

/**
 * GET /api/assignments/team-members/:orgId
 * Get all team members available for assignment in an organisation
 */
router.get('/team-members/:orgId',
    authenticateToken,
    async (req, res) => {
        try {
            const { orgId } = req.params;
            const AssignmentModel = require('./model');
            
            const teamMembers = await AssignmentModel.getTeamMembers(orgId);
            
            return res.status(200).json({
                success: true,
                data: teamMembers
            });
        } catch (error) {
            console.error('Error fetching team members:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching team members',
                error: error.message
            });
        }
    }
);

/**
 * GET /api/assignments/load-balance/:orgId
 * Get current assignment load balance for an organisation
 */
router.get('/load-balance/:orgId',
    authenticateToken,
    async (req, res) => {
        try {
            const { orgId } = req.params;
            const AssignmentModel = require('./model');
            
            const teamMembers = await AssignmentModel.getTeamMembers(orgId);
            const loadBalance = [];
            
            for (const member of teamMembers) {
                const assignments = await AssignmentModel.getUserAssignments(member.id, orgId);
                loadBalance.push({
                    user_id: member.id,
                    name: member.name,
                    email: member.email,
                    total_assignments: assignments.length,
                    active_assignments: assignments.filter(a => a.status === 'active').length
                });
            }
            
            return res.status(200).json({
                success: true,
                data: loadBalance
            });
        } catch (error) {
            console.error('Error fetching load balance:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching load balance',
                error: error.message
            });
        }
    }
);

/**
 * Analytics endpoints
 */

/**
 * GET /api/assignments/analytics
 * Get comprehensive assignment analytics
 */
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;
        const result = await AssignmentAnalytics.getAssignmentAnalytics(
            req.user.organisation_id, 
            date_from, 
            date_to
        );
        res.json(result);
    } catch (error) {
        console.error('Error getting assignment analytics:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get assignment analytics',
            error: error.message 
        });
    }
});

/**
 * GET /api/assignments/analytics/workload-balance
 * Get workload balance report
 */
router.get('/analytics/workload-balance', authenticateToken, async (req, res) => {
    try {
        const result = await AssignmentAnalytics.getWorkloadBalance(req.user.organisation_id);
        res.json(result);
    } catch (error) {
        console.error('Error getting workload balance:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get workload balance report',
            error: error.message 
        });
    }
});

/**
 * GET /api/assignments/analytics/performance-report
 * Generate performance report
 */
router.get('/analytics/performance-report', authenticateToken, async (req, res) => {
    try {
        const { user_id, date_from, date_to } = req.query;
        const result = await AssignmentAnalytics.generatePerformanceReport(
            req.user.organisation_id,
            user_id || null,
            date_from,
            date_to
        );
        res.json(result);
    } catch (error) {
        console.error('Error generating performance report:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate performance report',
            error: error.message 
        });
    }
});

module.exports = router;