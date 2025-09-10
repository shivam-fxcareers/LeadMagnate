const nodemailer = require('nodemailer');
const AssignmentModel = require('./model');

class AssignmentNotificationService {
    constructor() {
        // Initialize email transporter (configure based on your email service)
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'localhost',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    /**
     * Send notification when a new lead is assigned
     * @param {Object} assignmentData - Assignment data
     * @param {Object} leadData - Lead data
     * @param {Object} userData - User data
     */
    async notifyNewAssignment(assignmentData, leadData, userData) {
        try {
            const subject = `New Lead Assigned: ${leadData.name || 'Unknown'}`;
            const htmlContent = this.generateNewAssignmentEmail(assignmentData, leadData, userData);
            
            await this.sendEmail(userData.email, subject, htmlContent);
            
            // Log notification
            console.log(`New assignment notification sent to ${userData.email} for lead ${leadData.name}`);
            
            // Store notification in database (optional)
            await this.logNotification({
                type: 'new_assignment',
                recipient_id: userData.id,
                assignment_id: assignmentData.id,
                subject: subject,
                sent_at: new Date()
            });
            
        } catch (error) {
            console.error('Error sending new assignment notification:', error);
        }
    }

    /**
     * Send notification when a lead is reassigned
     * @param {Object} oldAssignment - Old assignment data
     * @param {Object} newAssignment - New assignment data
     * @param {Object} leadData - Lead data
     * @param {Object} oldUser - Old user data
     * @param {Object} newUser - New user data
     */
    async notifyReassignment(oldAssignment, newAssignment, leadData, oldUser, newUser) {
        try {
            // Notify old user about reassignment
            const oldUserSubject = `Lead Reassigned: ${leadData.name || 'Unknown'}`;
            const oldUserHtml = this.generateReassignmentEmail(leadData, oldUser, newUser, 'removed');
            
            await this.sendEmail(oldUser.email, oldUserSubject, oldUserHtml);
            
            // Notify new user about assignment
            const newUserSubject = `Lead Assigned to You: ${leadData.name || 'Unknown'}`;
            const newUserHtml = this.generateReassignmentEmail(leadData, oldUser, newUser, 'assigned');
            
            await this.sendEmail(newUser.email, newUserSubject, newUserHtml);
            
            console.log(`Reassignment notifications sent for lead ${leadData.name}`);
            
        } catch (error) {
            console.error('Error sending reassignment notifications:', error);
        }
    }

    /**
     * Send overdue assignment notifications
     * @param {number} organisationId - Organisation ID
     * @param {number} daysOverdue - Days overdue threshold
     */
    async notifyOverdueAssignments(organisationId, daysOverdue = 7) {
        try {
            const overdueAssignments = await AssignmentModel.getOverdueAssignments(organisationId, daysOverdue);
            
            for (const assignment of overdueAssignments) {
                const subject = `Overdue Lead Assignment: ${assignment.lead_name || 'Unknown'}`;
                const htmlContent = this.generateOverdueEmail(assignment);
                
                await this.sendEmail(assignment.assigned_to_email, subject, htmlContent);
                
                // Log notification
                await this.logNotification({
                    type: 'overdue_assignment',
                    recipient_id: assignment.assigned_to,
                    assignment_id: assignment.id,
                    subject: subject,
                    sent_at: new Date()
                });
            }
            
            console.log(`Sent ${overdueAssignments.length} overdue assignment notifications`);
            
        } catch (error) {
            console.error('Error sending overdue notifications:', error);
        }
    }

    /**
     * Send daily assignment summary to managers
     * @param {number} organisationId - Organisation ID
     */
    async sendDailyAssignmentSummary(organisationId) {
        try {
            const stats = await AssignmentModel.getAssignmentStats(organisationId);
            const teamMembers = await AssignmentModel.getTeamMembers(organisationId);
            
            // Get managers (users with admin or manager roles)
            const managers = await this.getManagers(organisationId);
            
            const subject = 'Daily Lead Assignment Summary';
            const htmlContent = this.generateDailySummaryEmail(stats, teamMembers, organisationId);
            
            for (const manager of managers) {
                await this.sendEmail(manager.email, subject, htmlContent);
            }
            
            console.log(`Daily summary sent to ${managers.length} managers`);
            
        } catch (error) {
            console.error('Error sending daily summary:', error);
        }
    }

    /**
     * Generate HTML email for new assignment
     */
    generateNewAssignmentEmail(assignmentData, leadData, userData) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">New Lead Assigned</h2>
                <p>Hello ${userData.name},</p>
                <p>A new lead has been assigned to you:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Lead Details</h3>
                    <p><strong>Name:</strong> ${leadData.name || 'Not provided'}</p>
                    <p><strong>Email:</strong> ${leadData.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</p>
                    <p><strong>Source:</strong> ${assignmentData.platform_key || 'Unknown'}</p>
                    <p><strong>Assigned At:</strong> ${new Date(assignmentData.assigned_at).toLocaleString()}</p>
                </div>
                
                <p>Please follow up with this lead as soon as possible.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
                    <p>This is an automated notification from LeadMagnate.</p>
                </div>
            </div>
        `;
    }

    /**
     * Generate HTML email for reassignment
     */
    generateReassignmentEmail(leadData, oldUser, newUser, type) {
        const isRemoved = type === 'removed';
        const title = isRemoved ? 'Lead Reassigned Away' : 'Lead Assigned to You';
        const message = isRemoved 
            ? `The lead "${leadData.name}" has been reassigned from you to ${newUser.name}.`
            : `The lead "${leadData.name}" has been reassigned to you from ${oldUser.name}.`;
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">${title}</h2>
                <p>Hello ${isRemoved ? oldUser.name : newUser.name},</p>
                <p>${message}</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Lead Details</h3>
                    <p><strong>Name:</strong> ${leadData.name || 'Not provided'}</p>
                    <p><strong>Email:</strong> ${leadData.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</p>
                </div>
                
                ${!isRemoved ? '<p>Please follow up with this lead as soon as possible.</p>' : ''}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
                    <p>This is an automated notification from LeadMagnate.</p>
                </div>
            </div>
        `;
    }

    /**
     * Generate HTML email for overdue assignment
     */
    generateOverdueEmail(assignment) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">Overdue Lead Assignment</h2>
                <p>Hello ${assignment.assigned_to_name},</p>
                <p>You have an overdue lead assignment that requires attention:</p>
                
                <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <h3 style="margin-top: 0; color: #856404;">Lead Details</h3>
                    <p><strong>Name:</strong> ${assignment.lead_name || 'Not provided'}</p>
                    <p><strong>Email:</strong> ${assignment.lead_email || 'Not provided'}</p>
                    <p><strong>Assigned:</strong> ${new Date(assignment.assigned_at).toLocaleString()}</p>
                    <p><strong>Days Overdue:</strong> ${assignment.days_overdue}</p>
                </div>
                
                <p style="color: #dc3545;"><strong>Please follow up with this lead immediately.</strong></p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
                    <p>This is an automated notification from LeadMagnate.</p>
                </div>
            </div>
        `;
    }

    /**
     * Generate HTML email for daily summary
     */
    generateDailySummaryEmail(stats, teamMembers, organisationId) {
        const teamMembersList = teamMembers.map(member => 
            `<tr><td>${member.name}</td><td>${member.email}</td><td>Active</td></tr>`
        ).join('');
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Daily Lead Assignment Summary</h2>
                <p>Here's your daily assignment summary:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Assignment Statistics</h3>
                    <p><strong>Total Assignments:</strong> ${stats.total_assignments || 0}</p>
                    <p><strong>Active Assignments:</strong> ${stats.active_assignments || 0}</p>
                    <p><strong>Completed Assignments:</strong> ${stats.completed_assignments || 0}</p>
                    <p><strong>Average Completion Time:</strong> ${stats.avg_completion_hours ? Math.round(stats.avg_completion_hours) + ' hours' : 'N/A'}</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Team Members</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #e9ecef;">
                                <th style="padding: 8px; text-align: left;">Name</th>
                                <th style="padding: 8px; text-align: left;">Email</th>
                                <th style="padding: 8px; text-align: left;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teamMembersList}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
                    <p>This is an automated daily summary from LeadMagnate.</p>
                </div>
            </div>
        `;
    }

    /**
     * Send email using configured transporter
     */
    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'noreply@leadmagnate.com',
                to: to,
                subject: subject,
                html: html
            };
            
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Log notification in database
     */
    async logNotification(notificationData) {
        try {
            // This would require a notifications table in the database
            // For now, just log to console
            console.log('Notification logged:', notificationData);
        } catch (error) {
            console.error('Error logging notification:', error);
        }
    }

    /**
     * Get managers for an organisation
     */
    async getManagers(organisationId) {
        try {
            const db = require('../config/dbConfig');
            const query = `
                SELECT u.id, u.name, u.email
                FROM users u
                WHERE u.organisation_id = ? 
                  AND u.role IN ('admin', 'manager')
                  AND u.status = 'active'
            `;
            
            const [rows] = await db.execute(query, [organisationId]);
            return rows;
        } catch (error) {
            console.error('Error getting managers:', error);
            return [];
        }
    }
}

module.exports = AssignmentNotificationService;