const rateLimit = require('express-rate-limit');
const validator = require('validator');

/**
 * Validation middleware for website form submissions
 */
class FormValidationMiddleware {
    
    /**
     * Validate basic lead form data
     */
    static validateLeadForm(req, res, next) {
        const { name, email, phone, company, message, organisation_id } = req.body;
        const errors = [];

        // Required field validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Name is required and must be a non-empty string');
        } else if (name.trim().length > 100) {
            errors.push('Name must be less than 100 characters');
        }

        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!validator.isEmail(email)) {
            errors.push('Invalid email format');
        } else if (email.length > 255) {
            errors.push('Email must be less than 255 characters');
        }

        // Optional field validation
        if (phone && typeof phone === 'string') {
            // Remove all non-digit characters for validation
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 10 || cleanPhone.length > 15) {
                errors.push('Phone number must be between 10-15 digits');
            }
        }

        if (company && (typeof company !== 'string' || company.length > 200)) {
            errors.push('Company name must be a string with less than 200 characters');
        }

        if (message && (typeof message !== 'string' || message.length > 2000)) {
            errors.push('Message must be a string with less than 2000 characters');
        }

        if (organisation_id && (!Number.isInteger(Number(organisation_id)) || Number(organisation_id) <= 0)) {
            errors.push('Organisation ID must be a positive integer');
        }

        // Check for potential spam patterns
        const spamPatterns = [
            /https?:\/\//gi, // URLs in name or message
            /<script[^>]*>.*?<\/script>/gi, // Script tags
            /<[^>]+>/g // HTML tags
        ];

        const textFields = [name, message, company].filter(Boolean);
        for (const field of textFields) {
            for (const pattern of spamPatterns) {
                if (pattern.test(field)) {
                    errors.push('Suspicious content detected. Please remove URLs or HTML tags.');
                    break;
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // Sanitize data
        req.body.name = validator.escape(name.trim());
        req.body.email = validator.normalizeEmail(email.trim());
        if (phone) req.body.phone = phone.trim();
        if (company) req.body.company = validator.escape(company.trim());
        if (message) req.body.message = validator.escape(message.trim());

        next();
    }

    /**
     * Validate landing page form data with additional fields
     */
    static validateLandingPageForm(req, res, next) {
        const { 
            name, email, phone, company, job_title, industry, 
            company_size, budget_range, timeline, interests,
            landing_page_id, campaign_id, organisation_id
        } = req.body;
        
        const errors = [];

        // Basic validation (reuse from validateLeadForm)
        FormValidationMiddleware.validateLeadForm(req, res, (err) => {
            if (err) return; // Error already handled

            // Additional landing page specific validation
            if (job_title && (typeof job_title !== 'string' || job_title.length > 100)) {
                errors.push('Job title must be a string with less than 100 characters');
            }

            if (industry && (typeof industry !== 'string' || industry.length > 100)) {
                errors.push('Industry must be a string with less than 100 characters');
            }

            const validCompanySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
            if (company_size && !validCompanySizes.includes(company_size)) {
                errors.push(`Company size must be one of: ${validCompanySizes.join(', ')}`);
            }

            const validBudgetRanges = ['<$10k', '$10k-$50k', '$50k-$100k', '$100k-$500k', '$500k+'];
            if (budget_range && !validBudgetRanges.includes(budget_range)) {
                errors.push(`Budget range must be one of: ${validBudgetRanges.join(', ')}`);
            }

            const validTimelines = ['immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months'];
            if (timeline && !validTimelines.includes(timeline)) {
                errors.push(`Timeline must be one of: ${validTimelines.join(', ')}`);
            }

            if (interests && (!Array.isArray(interests) || interests.length > 10)) {
                errors.push('Interests must be an array with maximum 10 items');
            }

            if (landing_page_id && (typeof landing_page_id !== 'string' || landing_page_id.length > 50)) {
                errors.push('Landing page ID must be a string with less than 50 characters');
            }

            if (campaign_id && (typeof campaign_id !== 'string' || campaign_id.length > 50)) {
                errors.push('Campaign ID must be a string with less than 50 characters');
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Landing page validation failed',
                    errors: errors
                });
            }

            // Sanitize additional fields
            if (job_title) req.body.job_title = validator.escape(job_title.trim());
            if (industry) req.body.industry = validator.escape(industry.trim());
            if (landing_page_id) req.body.landing_page_id = validator.escape(landing_page_id.trim());
            if (campaign_id) req.body.campaign_id = validator.escape(campaign_id.trim());

            next();
        });
    }

    /**
     * Validate bulk import data
     */
    static validateBulkImport(req, res, next) {
        const { leads, organisation_id, source_name } = req.body;
        const errors = [];

        if (!leads || !Array.isArray(leads)) {
            errors.push('Leads must be provided as an array');
        } else {
            if (leads.length === 0) {
                errors.push('Leads array cannot be empty');
            }
            
            if (leads.length > 1000) {
                errors.push('Maximum 1000 leads allowed per bulk import');
            }

            // Validate each lead in the array
            leads.forEach((lead, index) => {
                if (!lead.name || typeof lead.name !== 'string' || lead.name.trim().length === 0) {
                    errors.push(`Lead ${index + 1}: Name is required`);
                }
                
                if (!lead.email || typeof lead.email !== 'string' || !validator.isEmail(lead.email)) {
                    errors.push(`Lead ${index + 1}: Valid email is required`);
                }
            });
        }

        if (organisation_id && (!Number.isInteger(Number(organisation_id)) || Number(organisation_id) <= 0)) {
            errors.push('Organisation ID must be a positive integer');
        }

        if (source_name && (typeof source_name !== 'string' || source_name.length > 100)) {
            errors.push('Source name must be a string with less than 100 characters');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bulk import validation failed',
                errors: errors
            });
        }

        next();
    }

    /**
     * Validate UTM parameters
     */
    static validateUTMParameters(req, res, next) {
        const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = req.body;
        const utmFields = { utm_source, utm_medium, utm_campaign, utm_content, utm_term };
        
        for (const [key, value] of Object.entries(utmFields)) {
            if (value && (typeof value !== 'string' || value.length > 255)) {
                return res.status(400).json({
                    success: false,
                    message: `${key} must be a string with less than 255 characters`
                });
            }
            
            // Sanitize UTM parameters
            if (value) {
                req.body[key] = validator.escape(value.trim());
            }
        }

        next();
    }

    /**
     * Rate limiting for form submissions
     */
    static createRateLimit(windowMs = 15 * 60 * 1000, max = 10) {
        return rateLimit({
            windowMs: windowMs, // 15 minutes default
            max: max, // limit each IP to 10 requests per windowMs
            message: {
                success: false,
                message: 'Too many form submissions, please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
            // Skip rate limiting for localhost in development
            skip: (req) => {
                return process.env.NODE_ENV === 'development' && 
                       (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
            }
        });
    }

    /**
     * CORS middleware for form submissions
     */
    static corsForForms(req, res, next) {
        // Allow specific origins or all origins in development
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

        const origin = req.headers.origin;
        
        if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin || '*');
        }
        
        res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        
        next();
    }

    /**
     * Security headers middleware
     */
    static securityHeaders(req, res, next) {
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-XSS-Protection', '1; mode=block');
        res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        next();
    }
}

module.exports = FormValidationMiddleware;