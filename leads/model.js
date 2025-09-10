const { db } = require('../config/dbConfig');

class LeadsModel {
    /**
     * Create a new lead meta record
     * @param {Object} metaData - Lead metadata from Facebook webhook
     * @returns {Promise<number>} - Inserted lead_meta ID
     */
    static async createLeadMeta(metaData) {
        const {
            organisation_id,
            platform_key = 'facebook',
            source_lead_id,
            page_id,
            form_id,
            ad_id,
            campaign_id,
            created_time,
            page_url,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content,
            raw_webhook_data,
            processing_status = 'received',
            received_at
        } = metaData;

        const insertData = {
            organisation_id,
            platform_key,
            source_lead_id,
            processing_status,
            received_at: received_at || new Date()
        };

        // Add Facebook-specific fields if present
        if (page_id) insertData.page_id = page_id;
        if (form_id) insertData.form_id = form_id;
        if (ad_id) insertData.ad_id = ad_id;
        if (campaign_id) insertData.campaign_id = campaign_id;
        if (created_time) insertData.created_time = new Date(created_time * 1000);
        if (page_url) insertData.page_url = page_url;
        
        // Add UTM parameters
        if (utm_source) insertData.utm_source = utm_source;
        if (utm_medium) insertData.utm_medium = utm_medium;
        if (utm_campaign) insertData.utm_campaign = utm_campaign;
        if (utm_term) insertData.utm_term = utm_term;
        if (utm_content) insertData.utm_content = utm_content;
        
        // Add raw webhook data for website forms and other sources
        if (raw_webhook_data) {
            insertData.raw_webhook_data = typeof raw_webhook_data === 'string' ? 
                raw_webhook_data : JSON.stringify(raw_webhook_data);
        }

        const [leadMetaId] = await db('lead_meta').insert(insertData);
        return leadMetaId;
    }

    /**
     * Create a new lead data record
     * @param {Object} leadData - Lead data from Facebook Graph API
     * @returns {Promise<number>} - Inserted lead_data ID
     */
    static async createLeadData(leadData) {
        const {
            organisation_id,
            lead_meta_id,
            email,
            phone,
            first_name,
            last_name,
            full_name,
            name, // For website forms that use single name field
            raw_field_data,
            consent_time,
            platform_key = 'facebook',
            source_page_id,
            source_page_name,
            assigned_user_id = null,
            status = 'new',
            created_at
        } = leadData;

        const insertData = {
            organisation_id,
            lead_meta_id,
            email,
            phone,
            platform_key,
            source_page_id,
            status,
            assigned_user_id,
            created_at: created_at || new Date()
        };

        // Handle name fields - prioritize individual names, fallback to single name
        if (first_name) insertData.first_name = first_name;
        if (last_name) insertData.last_name = last_name;
        if (full_name) {
            insertData.full_name = full_name;
        } else if (name) {
            insertData.full_name = name;
            // Try to split single name into first/last if not already provided
            if (!first_name && !last_name) {
                const nameParts = name.trim().split(' ');
                if (nameParts.length >= 2) {
                    insertData.first_name = nameParts[0];
                    insertData.last_name = nameParts.slice(1).join(' ');
                } else {
                    insertData.first_name = name;
                }
            }
        }

        // Add optional fields
        if (source_page_name) insertData.source_page_name = source_page_name;
        if (consent_time) insertData.consent_time = new Date(consent_time * 1000);
        
        // Handle raw field data
        if (raw_field_data) {
            insertData.raw_field_data = typeof raw_field_data === 'string' ? 
                raw_field_data : JSON.stringify(raw_field_data);
        }

        const [leadDataId] = await db('lead_data').insert(insertData);
        return leadDataId;
    }

    /**
     * Update lead meta processing status
     * @param {number} leadMetaId - Lead meta ID
     * @param {string} status - Processing status (received, processed, failed)
     * @returns {Promise<void>}
     */
    static async updateLeadMetaStatus(leadMetaId, status) {
        await db('lead_meta')
            .where('id', leadMetaId)
            .update({ processing_status: status });
    }

    /**
     * Check if lead already exists to avoid duplicates
     * @param {string} platform_key - Platform key (facebook, instagram, website)
     * @param {string} source_lead_id - Source lead ID from platform
     * @param {number} organisation_id - Organization ID
     * @returns {Promise<Object|null>} - Existing lead meta or null
     */
    static async findExistingLeadMeta(platform_key, source_lead_id, organisation_id) {
        return db('lead_meta')
            .where({
                platform_key,
                source_lead_id,
                organisation_id
            })
            .first();
    }

    /**
     * Get lead data with meta information
     * @param {number} leadDataId - Lead data ID
     * @returns {Promise<Object|null>} - Lead data with meta info
     */
    static async getLeadWithMeta(leadDataId) {
        return db('lead_data')
            .join('lead_meta', 'lead_data.lead_meta_id', '=', 'lead_meta.id')
            .where('lead_data.id', leadDataId)
            .select(
                'lead_data.*',
                'lead_meta.platform_key as meta_platform',
                'lead_meta.source_lead_id',
                'lead_meta.page_id as meta_page_id',
                'lead_meta.form_id',
                'lead_meta.processing_status'
            )
            .first();
    }

    /**
     * Get all leads for an organization
     * @param {number} organisationId - Organization ID
     * @param {Object} options - Query options (limit, offset, status filter)
     * @returns {Promise<Array>} - Array of leads with meta info
     */
    static async getLeadsByOrganisation(organisationId, options = {}) {
        const { limit = 50, offset = 0, status = null, platform = null } = options;
        
        let query = db('lead_data')
            .join('lead_meta', 'lead_data.lead_meta_id', '=', 'lead_meta.id')
            .where('lead_data.organisation_id', organisationId)
            .select(
                'lead_data.*',
                'lead_meta.platform_key',
                'lead_meta.source_lead_id',
                'lead_meta.page_id',
                'lead_meta.form_id',
                'lead_meta.processing_status',
                'lead_meta.received_at'
            )
            .orderBy('lead_data.created_at', 'desc');

        if (status) {
            query = query.where('lead_data.status', status);
        }

        if (platform) {
            query = query.where('lead_meta.platform_key', platform);
        }

        return query.limit(limit).offset(offset);
    }

    /**
     * Update lead status
     * @param {number} leadDataId - Lead data ID
     * @param {string} status - New status
     * @param {number} assignedUserId - Optional assigned user ID
     * @returns {Promise<void>}
     */
    static async updateLeadStatus(leadDataId, status, assignedUserId = null) {
        const updateData = { status };
        
        if (assignedUserId) {
            updateData.assigned_user_id = assignedUserId;
            updateData.assigned_at = new Date();
        }

        await db('lead_data')
            .where('id', leadDataId)
            .update(updateData);
    }

    /**
     * Get lead statistics for an organization
     * @param {number} organisationId - Organization ID
     * @returns {Promise<Object>} - Lead statistics
     */
    static async getLeadStats(organisationId) {
        const stats = await db('lead_data')
            .where('organisation_id', organisationId)
            .select(
                db.raw('COUNT(*) as total_leads'),
                db.raw('COUNT(CASE WHEN status = "new" THEN 1 END) as new_leads'),
                db.raw('COUNT(CASE WHEN status = "qualified" THEN 1 END) as qualified_leads'),
                db.raw('COUNT(CASE WHEN status = "won" THEN 1 END) as won_leads'),
                db.raw('COUNT(CASE WHEN status = "lost" THEN 1 END) as lost_leads')
            )
            .first();

        return stats;
    }
}

module.exports = LeadsModel;