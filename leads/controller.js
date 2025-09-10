const axios = require('axios');
const LeadsModel = require('./model');
const AssignmentController = require('../assignments/controller');

class LeadsController {
    /**
     * Handle Facebook Lead Ads webhook
     * Receives POST requests from Facebook and processes lead data
     */
    static async handleFacebookWebhook(req, res) {
        try {
            const { body } = req;
            
            // Validate webhook payload structure
            if (!body.entry || !Array.isArray(body.entry)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook payload structure'
                });
            }

            // Process each entry in the webhook
            for (const entry of body.entry) {
                if (entry.changes && Array.isArray(entry.changes)) {
                    for (const change of entry.changes) {
                        if (change.field === 'leadgen' && change.value) {
                            await LeadsController.processLeadgenChange(change.value);
                        }
                    }
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Webhook processed successfully'
            });

        } catch (error) {
            console.error('Facebook webhook error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error processing webhook',
                error: error.message
            });
        }
    }

    /**
     * Process leadgen change from Facebook webhook
     * @param {Object} changeValue - The leadgen change value from webhook
     */
    static async processLeadgenChange(changeValue) {
        try {
            const { leadgen_id, page_id, form_id, adgroup_id, campaign_id, created_time } = changeValue;
            
            // Validate required fields
            if (!leadgen_id || !page_id) {
                console.error('Missing required fields in leadgen change:', changeValue);
                return;
            }

            // Check if page_id matches our configured FB_PAGE_ID
            const configuredPageId = process.env.FB_PAGE_ID;
            if (configuredPageId && page_id !== configuredPageId) {
                console.log(`Ignoring lead from page ${page_id}, not matching configured page ${configuredPageId}`);
                return;
            }

            // For now, use a hardcoded organisation_id (you can modify this logic)
            // In a real scenario, you might map page_id to organisation_id
            const organisation_id = 1; // Default to first organisation

            // Check for duplicate leads
            const existingLead = await LeadsModel.findExistingLeadMeta(
                'facebook',
                leadgen_id,
                organisation_id
            );

            if (existingLead) {
                console.log(`Lead ${leadgen_id} already exists, skipping`);
                return;
            }

            // Create lead meta record
            const leadMetaData = {
                organisation_id,
                platform_key: 'facebook',
                source_lead_id: leadgen_id,
                page_id,
                form_id,
                ad_id: adgroup_id,
                campaign_id,
                created_time,
                processing_status: 'received'
            };

            const leadMetaId = await LeadsModel.createLeadMeta(leadMetaData);
            console.log(`Created lead meta record with ID: ${leadMetaId}`);

            // Fetch full lead details from Facebook Graph API
            await LeadsController.fetchAndSaveLeadDetails(leadgen_id, leadMetaId, organisation_id, page_id);

            // Auto-assign lead to team member using round-robin
            try {
                await AssignmentController.autoAssignLead(leadMetaId, organisation_id);
                console.log(`Auto-assigned Facebook lead ${leadMetaId} to team member`);
            } catch (assignmentError) {
                console.error('Error auto-assigning Facebook lead:', assignmentError);
                // Don't fail the entire process if assignment fails
            }

        } catch (error) {
            console.error('Error processing leadgen change:', error);
            throw error;
        }
    }

    /**
     * Fetch lead details from Facebook Graph API and save to database
     * @param {string} leadgenId - Facebook leadgen ID
     * @param {number} leadMetaId - Lead meta ID from database
     * @param {number} organisationId - Organisation ID
     * @param {string} pageId - Facebook page ID
     */
    static async fetchAndSaveLeadDetails(leadgenId, leadMetaId, organisationId, pageId) {
        try {
            const accessToken = process.env.FB_ACCESS_TOKEN;
            if (!accessToken) {
                throw new Error('FB_ACCESS_TOKEN not configured');
            }

            // Call Facebook Graph API to get lead details
            const graphApiUrl = `https://graph.facebook.com/v17.0/${leadgenId}?access_token=${accessToken}`;
            const response = await axios.get(graphApiUrl);
            
            const leadData = response.data;
            console.log('Facebook Graph API response:', JSON.stringify(leadData, null, 2));

            // Extract lead information
            const extractedData = LeadsController.extractLeadData(leadData, leadMetaId, organisationId, pageId);
            
            // Save lead data to database
            const leadDataId = await LeadsModel.createLeadData(extractedData);
            console.log(`Created lead data record with ID: ${leadDataId}`);

            // Update lead meta status to processed
            await LeadsModel.updateLeadMetaStatus(leadMetaId, 'processed');
            console.log(`Updated lead meta ${leadMetaId} status to processed`);

        } catch (error) {
            console.error('Error fetching lead details from Facebook:', error);
            
            // Update lead meta status to failed
            try {
                await LeadsModel.updateLeadMetaStatus(leadMetaId, 'failed');
            } catch (updateError) {
                console.error('Error updating lead meta status to failed:', updateError);
            }
            
            throw error;
        }
    }

    /**
     * Extract and format lead data from Facebook Graph API response
     * @param {Object} fbLeadData - Facebook lead data from Graph API
     * @param {number} leadMetaId - Lead meta ID
     * @param {number} organisationId - Organisation ID
     * @param {string} pageId - Facebook page ID
     * @returns {Object} - Formatted lead data for database
     */
    static extractLeadData(fbLeadData, leadMetaId, organisationId, pageId) {
        const { field_data, created_time, id, page_name } = fbLeadData;
        
        // Initialize extracted data
        let email = null;
        let phone = null;
        let first_name = null;
        let last_name = null;
        let full_name = null;
        
        // Process field_data to extract standard fields
        if (field_data && Array.isArray(field_data)) {
            field_data.forEach(field => {
                const fieldName = field.name ? field.name.toLowerCase() : '';
                const fieldValue = field.values && field.values[0] ? field.values[0] : null;
                
                if (!fieldValue) return;
                
                // Map common field names to our database fields
                switch (fieldName) {
                    case 'email':
                        email = fieldValue;
                        break;
                    case 'phone_number':
                    case 'phone':
                        phone = fieldValue;
                        break;
                    case 'first_name':
                        first_name = fieldValue;
                        break;
                    case 'last_name':
                        last_name = fieldValue;
                        break;
                    case 'full_name':
                    case 'name':
                        full_name = fieldValue;
                        break;
                }
            });
        }
        
        // If full_name is not provided but we have first_name and last_name, combine them
        if (!full_name && (first_name || last_name)) {
            full_name = [first_name, last_name].filter(Boolean).join(' ');
        }
        
        return {
            organisation_id: organisationId,
            lead_meta_id: leadMetaId,
            email,
            phone,
            first_name,
            last_name,
            full_name,
            raw_field_data: field_data || [],
            consent_time: created_time,
            platform_key: 'facebook',
            source_page_id: pageId,
            source_page_name: page_name || null
        };
    }

    /**
     * Webhook verification for Facebook (GET request)
     * Facebook sends a GET request to verify the webhook URL
     */
    static verifyWebhook(req, res) {
        try {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            
            // Verify the webhook
            const verifyToken = process.env.FB_WEBHOOK_VERIFY_TOKEN || 'your_verify_token';
            
            if (mode === 'subscribe' && token === verifyToken) {
                console.log('Facebook webhook verified successfully');
                return res.status(200).send(challenge);
            } else {
                console.error('Facebook webhook verification failed');
                return res.status(403).json({
                    success: false,
                    message: 'Webhook verification failed'
                });
            }
        } catch (error) {
            console.error('Webhook verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during webhook verification'
            });
        }
    }

    /**
     * Get leads for an organisation (with pagination and filtering)
     */
    static async getLeads(req, res) {
        try {
            const { organisationId } = req.params;
            const { page = 1, limit = 50, status, platform } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                status,
                platform
            };
            
            const leads = await LeadsModel.getLeadsByOrganisation(organisationId, options);
            const stats = await LeadsModel.getLeadStats(organisationId);
            
            return res.status(200).json({
                success: true,
                data: {
                    leads,
                    stats,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: stats.total_leads
                    }
                }
            });
            
        } catch (error) {
            console.error('Error fetching leads:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching leads',
                error: error.message
            });
        }
    }

    /**
     * Get a specific lead by ID
     */
    static async getLeadById(req, res) {
        try {
            const { leadId } = req.params;
            
            const lead = await LeadsModel.getLeadWithMeta(leadId);
            
            if (!lead) {
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: lead
            });
            
        } catch (error) {
            console.error('Error fetching lead:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching lead',
                error: error.message
            });
        }
    }

    /**
     * Update lead status
     */
    static async updateLeadStatus(req, res) {
        try {
            const { leadId } = req.params;
            const { status, assigned_user_id } = req.body;
            
            // Validate status
            const validStatuses = ['new', 'qualified', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status value'
                });
            }
            
            await LeadsModel.updateLeadStatus(leadId, status, assigned_user_id);
            
            return res.status(200).json({
                success: true,
                message: 'Lead status updated successfully'
            });
            
        } catch (error) {
            console.error('Error updating lead status:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating lead status',
                error: error.message
            });
        }
    }

    /**
     * Capture lead from website form submission
     * POST /api/leads/capture
     */
    static async captureWebsiteLead(req, res) {
        try {
            const { 
                name, 
                email, 
                phone, 
                company, 
                message, 
                source_url, 
                form_name,
                organisation_id,
                utm_source,
                utm_medium,
                utm_campaign,
                utm_content,
                utm_term,
                custom_fields
            } = req.body;

            // Validate required fields
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required fields'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Create lead meta record for website form
            const leadMetaData = {
                source_lead_id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                platform_key: 'website',
                organisation_id: organisation_id || 1, // Default to org 1 if not specified
                raw_webhook_data: JSON.stringify({
                    form_data: req.body,
                    headers: {
                        'user-agent': req.get('User-Agent'),
                        'referer': req.get('Referer'),
                        'x-forwarded-for': req.get('X-Forwarded-For') || req.ip
                    },
                    timestamp: new Date().toISOString()
                }),
                processing_status: 'pending',
                received_at: new Date()
            };

            const leadMetaId = await LeadsModel.createLeadMeta(leadMetaData);
            console.log(`Created website lead meta record with ID: ${leadMetaId}`);

            // Prepare lead data
            const leadData = {
                lead_meta_id: leadMetaId,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone ? phone.trim() : null,
                organisation_id: organisation_id || 1,
                source_page_id: source_url || req.get('Referer') || 'unknown',
                raw_field_data: JSON.stringify({
                    name,
                    email,
                    phone,
                    company: company || null,
                    message: message || null,
                    form_name: form_name || 'contact_form',
                    source_url: source_url || req.get('Referer'),
                    utm_data: {
                        utm_source,
                        utm_medium,
                        utm_campaign,
                        utm_content,
                        utm_term
                    },
                    custom_fields: custom_fields || {},
                    ip_address: req.get('X-Forwarded-For') || req.ip,
                    user_agent: req.get('User-Agent')
                }),
                status: 'new',
                created_at: new Date()
            };

            // Create lead data record
            const leadDataId = await LeadsModel.createLeadData(leadData);
            console.log(`Created website lead data record with ID: ${leadDataId}`);

            // Update meta status to processed
            await LeadsModel.updateLeadMetaStatus(leadMetaId, 'processed');
            console.log(`Updated lead meta ${leadMetaId} status to processed`);

            // Auto-assign lead to team member using round-robin
            try {
                await AssignmentController.autoAssignLead(leadMetaId, organisation_id || 1);
                console.log(`Auto-assigned website lead ${leadMetaId} to team member`);
            } catch (assignmentError) {
                console.error('Error auto-assigning website lead:', assignmentError);
                // Don't fail the entire process if assignment fails
            }

            return res.status(201).json({
                success: true,
                message: 'Lead captured successfully',
                data: {
                    lead_id: leadDataId,
                    lead_meta_id: leadMetaId,
                    source: 'website'
                }
            });

        } catch (error) {
            console.error('Error capturing website lead:', error);
            return res.status(500).json({
                success: false,
                message: 'Error capturing lead',
                error: error.message
            });
        }
    }

    /**
     * Capture lead from landing page with additional tracking
     * POST /api/leads/landing-page
     */
    static async captureLandingPageLead(req, res) {
        try {
            const { 
                name, 
                email, 
                phone, 
                company,
                job_title,
                industry,
                company_size,
                budget_range,
                timeline,
                interests,
                landing_page_id,
                campaign_id,
                organisation_id,
                utm_source,
                utm_medium,
                utm_campaign,
                utm_content,
                utm_term,
                gclid, // Google Click ID
                fbclid, // Facebook Click ID
                custom_fields
            } = req.body;

            // Validate required fields
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required fields'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Create lead meta record for landing page
            const leadMetaData = {
                source_lead_id: `lp_${landing_page_id || 'unknown'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                platform_key: 'landing_page',
                organisation_id: organisation_id || 1,
                raw_webhook_data: JSON.stringify({
                    form_data: req.body,
                    tracking: {
                        landing_page_id,
                        campaign_id,
                        gclid,
                        fbclid,
                        utm_data: {
                            utm_source,
                            utm_medium,
                            utm_campaign,
                            utm_content,
                            utm_term
                        }
                    },
                    headers: {
                        'user-agent': req.get('User-Agent'),
                        'referer': req.get('Referer'),
                        'x-forwarded-for': req.get('X-Forwarded-For') || req.ip
                    },
                    timestamp: new Date().toISOString()
                }),
                processing_status: 'pending',
                received_at: new Date()
            };

            const leadMetaId = await LeadsModel.createLeadMeta(leadMetaData);
            console.log(`Created landing page lead meta record with ID: ${leadMetaId}`);

            // Prepare enhanced lead data for landing pages
            const leadData = {
                lead_meta_id: leadMetaId,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone ? phone.trim() : null,
                organisation_id: organisation_id || 1,
                source_page_id: landing_page_id || req.get('Referer') || 'unknown',
                raw_field_data: JSON.stringify({
                    personal_info: {
                        name,
                        email,
                        phone,
                        job_title: job_title || null
                    },
                    company_info: {
                        company: company || null,
                        industry: industry || null,
                        company_size: company_size || null
                    },
                    project_info: {
                        budget_range: budget_range || null,
                        timeline: timeline || null,
                        interests: interests || []
                    },
                    tracking_info: {
                        landing_page_id,
                        campaign_id,
                        utm_data: {
                            utm_source,
                            utm_medium,
                            utm_campaign,
                            utm_content,
                            utm_term
                        },
                        click_ids: {
                            gclid,
                            fbclid
                        }
                    },
                    technical_info: {
                        ip_address: req.get('X-Forwarded-For') || req.ip,
                        user_agent: req.get('User-Agent'),
                        referer: req.get('Referer')
                    },
                    custom_fields: custom_fields || {}
                }),
                status: 'new',
                created_at: new Date()
            };

            // Create lead data record
            const leadDataId = await LeadsModel.createLeadData(leadData);
            console.log(`Created landing page lead data record with ID: ${leadDataId}`);

            // Update meta status to processed
            await LeadsModel.updateLeadMetaStatus(leadMetaId, 'processed');
            console.log(`Updated lead meta ${leadMetaId} status to processed`);

            // Auto-assign lead to team member using round-robin
            try {
                await AssignmentController.autoAssignLead(leadMetaId, organisation_id || 1);
                console.log(`Auto-assigned landing page lead ${leadMetaId} to team member`);
            } catch (assignmentError) {
                console.error('Error auto-assigning landing page lead:', assignmentError);
                // Don't fail the entire process if assignment fails
            }

            return res.status(201).json({
                success: true,
                message: 'Landing page lead captured successfully',
                data: {
                    lead_id: leadDataId,
                    lead_meta_id: leadMetaId,
                    source: 'landing_page',
                    tracking: {
                        landing_page_id,
                        campaign_id
                    }
                }
            });

        } catch (error) {
            console.error('Error capturing landing page lead:', error);
            return res.status(500).json({
                success: false,
                message: 'Error capturing landing page lead',
                error: error.message
            });
        }
    }

    /**
     * Bulk lead import from CSV or external sources
     * POST /api/leads/bulk-import
     */
    static async bulkImportLeads(req, res) {
        try {
            const { leads, organisation_id, source_name, import_notes } = req.body;

            if (!leads || !Array.isArray(leads) || leads.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Leads array is required and must not be empty'
                });
            }

            if (leads.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 1000 leads allowed per bulk import'
                });
            }

            const results = {
                successful: 0,
                failed: 0,
                errors: []
            };

            const batchId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            for (let i = 0; i < leads.length; i++) {
                const lead = leads[i];
                
                try {
                    // Validate required fields
                    if (!lead.name || !lead.email) {
                        results.failed++;
                        results.errors.push({
                            row: i + 1,
                            error: 'Name and email are required'
                        });
                        continue;
                    }

                    // Validate email format
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(lead.email)) {
                        results.failed++;
                        results.errors.push({
                            row: i + 1,
                            error: 'Invalid email format'
                        });
                        continue;
                    }

                    // Create lead meta record
                    const leadMetaData = {
                        source_lead_id: `${batchId}_${i + 1}`,
                        platform_key: 'bulk_import',
                        organisation_id: organisation_id || 1,
                        raw_webhook_data: JSON.stringify({
                            batch_id: batchId,
                            row_number: i + 1,
                            source_name: source_name || 'bulk_import',
                            import_notes: import_notes || null,
                            original_data: lead,
                            imported_by: req.user ? req.user.id : null,
                            timestamp: new Date().toISOString()
                        }),
                        processing_status: 'pending',
                        received_at: new Date()
                    };

                    const leadMetaId = await LeadsModel.createLeadMeta(leadMetaData);

                    // Prepare lead data
                    const leadData = {
                        lead_meta_id: leadMetaId,
                        name: lead.name.trim(),
                        email: lead.email.toLowerCase().trim(),
                        phone: lead.phone ? lead.phone.trim() : null,
                        organisation_id: organisation_id || 1,
                        source_page_id: source_name || 'bulk_import',
                        raw_field_data: JSON.stringify({
                            ...lead,
                            import_info: {
                                batch_id: batchId,
                                row_number: i + 1,
                                source_name: source_name || 'bulk_import',
                                imported_at: new Date().toISOString(),
                                imported_by: req.user ? req.user.id : null
                            }
                        }),
                        status: 'new',
                        created_at: new Date()
                    };

                    // Create lead data record
                    await LeadsModel.createLeadData(leadData);
                    
                    // Update meta status to processed
                    await LeadsModel.updateLeadMetaStatus(leadMetaId, 'processed');
                    
                    results.successful++;

                } catch (leadError) {
                    console.error(`Error processing lead ${i + 1}:`, leadError);
                    results.failed++;
                    results.errors.push({
                        row: i + 1,
                        error: leadError.message
                    });
                }
            }

            console.log(`Bulk import completed: ${results.successful} successful, ${results.failed} failed`);

            return res.status(200).json({
                success: true,
                message: `Bulk import completed: ${results.successful} successful, ${results.failed} failed`,
                data: {
                    batch_id: batchId,
                    results
                }
            });

        } catch (error) {
            console.error('Error in bulk import:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing bulk import',
                error: error.message
            });
        }
    }
}

module.exports = LeadsController;