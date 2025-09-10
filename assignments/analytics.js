const AssignmentModel = require('./model');

class AssignmentAnalytics {
    /**
     * Get comprehensive assignment analytics for an organisation
     * @param {number} organisationId - Organisation ID
     * @param {string} dateFrom - Start date (YYYY-MM-DD)
     * @param {string} dateTo - End date (YYYY-MM-DD)
     */
    static async getAssignmentAnalytics(organisationId, dateFrom = null, dateTo = null) {
        try {
            const db = require('../config/dbConfig');
            
            // Set default date range if not provided (last 30 days)
            if (!dateFrom || !dateTo) {
                const today = new Date();
                dateTo = today.toISOString().split('T')[0];
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
            }
            
            // Get basic assignment statistics
            const basicStats = await this.getBasicStats(organisationId, dateFrom, dateTo);
            
            // Get team performance metrics
            const teamPerformance = await this.getTeamPerformance(organisationId, dateFrom, dateTo);
            
            // Get assignment distribution
            const assignmentDistribution = await this.getAssignmentDistribution(organisationId, dateFrom, dateTo);
            
            // Get conversion metrics
            const conversionMetrics = await this.getConversionMetrics(organisationId, dateFrom, dateTo);
            
            // Get response time analytics
            const responseTimeAnalytics = await this.getResponseTimeAnalytics(organisationId, dateFrom, dateTo);
            
            // Get daily assignment trends
            const dailyTrends = await this.getDailyAssignmentTrends(organisationId, dateFrom, dateTo);
            
            return {
                success: true,
                organisation_id: organisationId,
                date_range: { from: dateFrom, to: dateTo },
                analytics: {
                    basic_stats: basicStats,
                    team_performance: teamPerformance,
                    assignment_distribution: assignmentDistribution,
                    conversion_metrics: conversionMetrics,
                    response_time_analytics: responseTimeAnalytics,
                    daily_trends: dailyTrends
                }
            };
        } catch (error) {
            console.error('Error getting assignment analytics:', error);
            throw error;
        }
    }

    /**
     * Get basic assignment statistics
     */
    static async getBasicStats(organisationId, dateFrom, dateTo) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    COUNT(*) as total_assignments,
                    COUNT(CASE WHEN la.status = 'active' THEN 1 END) as active_assignments,
                    COUNT(CASE WHEN la.status = 'completed' THEN 1 END) as completed_assignments,
                    COUNT(CASE WHEN la.status = 'cancelled' THEN 1 END) as cancelled_assignments,
                    COUNT(CASE WHEN la.status = 'reassigned' THEN 1 END) as reassigned_assignments,
                    AVG(CASE WHEN la.status = 'completed' AND la.completed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(HOUR, la.assigned_at, la.completed_at) END) as avg_completion_hours,
                    COUNT(DISTINCT la.assigned_to) as active_team_members
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                WHERE lm.organisation_id = ?
                  AND DATE(la.assigned_at) BETWEEN ? AND ?
            `;
            
            const [rows] = await db.execute(query, [organisationId, dateFrom, dateTo]);
            return rows[0];
        } catch (error) {
            console.error('Error getting basic stats:', error);
            throw error;
        }
    }

    /**
     * Get team performance metrics
     */
    static async getTeamPerformance(organisationId, dateFrom, dateTo) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    u.id as user_id,
                    u.name as user_name,
                    u.email as user_email,
                    COUNT(*) as total_assignments,
                    COUNT(CASE WHEN la.status = 'completed' THEN 1 END) as completed_assignments,
                    COUNT(CASE WHEN la.status = 'active' THEN 1 END) as active_assignments,
                    AVG(CASE WHEN la.status = 'completed' AND la.completed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(HOUR, la.assigned_at, la.completed_at) END) as avg_completion_hours,
                    ROUND(
                        (COUNT(CASE WHEN la.status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2
                    ) as completion_rate_percent
                FROM users u
                JOIN lead_assignments la ON u.id = la.assigned_to
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                WHERE u.organisation_id = ?
                  AND u.role = 'team_member'
                  AND DATE(la.assigned_at) BETWEEN ? AND ?
                GROUP BY u.id, u.name, u.email
                ORDER BY total_assignments DESC
            `;
            
            const [rows] = await db.execute(query, [organisationId, dateFrom, dateTo]);
            return rows;
        } catch (error) {
            console.error('Error getting team performance:', error);
            throw error;
        }
    }

    /**
     * Get assignment distribution by source
     */
    static async getAssignmentDistribution(organisationId, dateFrom, dateTo) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    lm.platform_key as source,
                    COUNT(*) as assignment_count,
                    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) 
                        FROM lead_assignments la2 
                        JOIN lead_meta lm2 ON la2.lead_meta_id = lm2.id 
                        WHERE lm2.organisation_id = ? 
                        AND DATE(la2.assigned_at) BETWEEN ? AND ?)), 2) as percentage
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                WHERE lm.organisation_id = ?
                  AND DATE(la.assigned_at) BETWEEN ? AND ?
                GROUP BY lm.platform_key
                ORDER BY assignment_count DESC
            `;
            
            const [rows] = await db.execute(query, [organisationId, dateFrom, dateTo, organisationId, dateFrom, dateTo]);
            return rows;
        } catch (error) {
            console.error('Error getting assignment distribution:', error);
            throw error;
        }
    }

    /**
     * Get conversion metrics
     */
    static async getConversionMetrics(organisationId, dateFrom, dateTo) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    COUNT(*) as total_leads,
                    COUNT(CASE WHEN ld.status IN ('converted', 'won') THEN 1 END) as converted_leads,
                    COUNT(CASE WHEN ld.status = 'lost' THEN 1 END) as lost_leads,
                    COUNT(CASE WHEN ld.status = 'new' THEN 1 END) as new_leads,
                    ROUND(
                        (COUNT(CASE WHEN ld.status IN ('converted', 'won') THEN 1 END) * 100.0 / COUNT(*)), 2
                    ) as conversion_rate_percent,
                    AVG(CASE WHEN ld.status IN ('converted', 'won') AND la.completed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(DAY, la.assigned_at, la.completed_at) END) as avg_days_to_convert
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                JOIN lead_data ld ON lm.id = ld.lead_meta_id
                WHERE lm.organisation_id = ?
                  AND DATE(la.assigned_at) BETWEEN ? AND ?
            `;
            
            const [rows] = await db.execute(query, [organisationId, dateFrom, dateTo]);
            return rows[0];
        } catch (error) {
            console.error('Error getting conversion metrics:', error);
            throw error;
        }
    }

    /**
     * Get response time analytics
     */
    static async getResponseTimeAnalytics(organisationId, dateFrom, dateTo) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    AVG(TIMESTAMPDIFF(MINUTE, la.assigned_at, la.created_at)) as avg_assignment_delay_minutes,
                    MIN(TIMESTAMPDIFF(MINUTE, la.assigned_at, la.created_at)) as min_assignment_delay_minutes,
                    MAX(TIMESTAMPDIFF(MINUTE, la.assigned_at, la.created_at)) as max_assignment_delay_minutes,
                    COUNT(CASE WHEN TIMESTAMPDIFF(MINUTE, la.assigned_at, la.created_at) <= 5 THEN 1 END) as assignments_within_5min,
                    COUNT(CASE WHEN TIMESTAMPDIFF(MINUTE, la.assigned_at, la.created_at) <= 15 THEN 1 END) as assignments_within_15min,
                    COUNT(CASE WHEN TIMESTAMPDIFF(MINUTE, la.assigned_at, la.created_at) <= 60 THEN 1 END) as assignments_within_1hour
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                WHERE lm.organisation_id = ?
                  AND DATE(la.assigned_at) BETWEEN ? AND ?
                  AND la.created_at IS NOT NULL
            `;
            
            const [rows] = await db.execute(query, [organisationId, dateFrom, dateTo]);
            return rows[0];
        } catch (error) {
            console.error('Error getting response time analytics:', error);
            throw error;
        }
    }

    /**
     * Get daily assignment trends
     */
    static async getDailyAssignmentTrends(organisationId, dateFrom, dateTo) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    DATE(la.assigned_at) as assignment_date,
                    COUNT(*) as total_assignments,
                    COUNT(CASE WHEN la.status = 'completed' THEN 1 END) as completed_assignments,
                    COUNT(DISTINCT la.assigned_to) as active_team_members,
                    AVG(CASE WHEN la.status = 'completed' AND la.completed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(HOUR, la.assigned_at, la.completed_at) END) as avg_completion_hours
                FROM lead_assignments la
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                WHERE lm.organisation_id = ?
                  AND DATE(la.assigned_at) BETWEEN ? AND ?
                GROUP BY DATE(la.assigned_at)
                ORDER BY assignment_date ASC
            `;
            
            const [rows] = await db.execute(query, [organisationId, dateFrom, dateTo]);
            return rows;
        } catch (error) {
            console.error('Error getting daily trends:', error);
            throw error;
        }
    }

    /**
     * Get workload balance report
     */
    static async getWorkloadBalance(organisationId) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    u.id as user_id,
                    u.name as user_name,
                    u.email as user_email,
                    COUNT(CASE WHEN la.status = 'active' THEN 1 END) as active_assignments,
                    COUNT(CASE WHEN la.status = 'completed' AND DATE(la.completed_at) = CURDATE() THEN 1 END) as completed_today,
                    COUNT(CASE WHEN la.status = 'active' AND la.assigned_at < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as overdue_assignments,
                    ROUND(AVG(CASE WHEN la.status = 'completed' AND la.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                        THEN TIMESTAMPDIFF(HOUR, la.assigned_at, la.completed_at) END), 2) as avg_completion_hours_30d
                FROM users u
                LEFT JOIN lead_assignments la ON u.id = la.assigned_to
                LEFT JOIN lead_meta lm ON la.lead_meta_id = lm.id AND lm.organisation_id = ?
                WHERE u.organisation_id = ?
                  AND u.role = 'team_member'
                  AND u.status = 'active'
                GROUP BY u.id, u.name, u.email
                ORDER BY active_assignments DESC
            `;
            
            const [rows] = await db.execute(query, [organisationId, organisationId]);
            return {
                success: true,
                workload_balance: rows,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting workload balance:', error);
            throw error;
        }
    }

    /**
     * Generate assignment performance report
     */
    static async generatePerformanceReport(organisationId, userId = null, dateFrom = null, dateTo = null) {
        try {
            // Set default date range if not provided (last 30 days)
            if (!dateFrom || !dateTo) {
                const today = new Date();
                dateTo = today.toISOString().split('T')[0];
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
            }

            let analytics;
            if (userId) {
                // Individual user report
                analytics = await this.getUserPerformanceReport(organisationId, userId, dateFrom, dateTo);
            } else {
                // Organisation-wide report
                analytics = await this.getAssignmentAnalytics(organisationId, dateFrom, dateTo);
            }

            return {
                success: true,
                report_type: userId ? 'individual' : 'organisation',
                organisation_id: organisationId,
                user_id: userId,
                date_range: { from: dateFrom, to: dateTo },
                generated_at: new Date().toISOString(),
                data: analytics
            };
        } catch (error) {
            console.error('Error generating performance report:', error);
            throw error;
        }
    }

    /**
     * Get individual user performance report
     */
    static async getUserPerformanceReport(organisationId, userId, dateFrom, dateTo) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT 
                    u.name as user_name,
                    u.email as user_email,
                    COUNT(*) as total_assignments,
                    COUNT(CASE WHEN la.status = 'active' THEN 1 END) as active_assignments,
                    COUNT(CASE WHEN la.status = 'completed' THEN 1 END) as completed_assignments,
                    COUNT(CASE WHEN la.status = 'cancelled' THEN 1 END) as cancelled_assignments,
                    ROUND((COUNT(CASE WHEN la.status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2) as completion_rate,
                    AVG(CASE WHEN la.status = 'completed' AND la.completed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(HOUR, la.assigned_at, la.completed_at) END) as avg_completion_hours,
                    MIN(CASE WHEN la.status = 'completed' AND la.completed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(HOUR, la.assigned_at, la.completed_at) END) as min_completion_hours,
                    MAX(CASE WHEN la.status = 'completed' AND la.completed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(HOUR, la.assigned_at, la.completed_at) END) as max_completion_hours
                FROM users u
                JOIN lead_assignments la ON u.id = la.assigned_to
                JOIN lead_meta lm ON la.lead_meta_id = lm.id
                WHERE u.id = ?
                  AND lm.organisation_id = ?
                  AND DATE(la.assigned_at) BETWEEN ? AND ?
                GROUP BY u.id, u.name, u.email
            `;
            
            const [rows] = await db.execute(query, [userId, organisationId, dateFrom, dateTo]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user performance report:', error);
            throw error;
        }
    }
}

module.exports = AssignmentAnalytics;