const express = require('express');
const LeadsController = require('./controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkModulePermission } = require('../middlewares/permission.middleware');
const FormValidationMiddleware = require('../middlewares/form-validation.middleware');

const router = express.Router();

// Define module ID for leads management (this will need to be added to the modules table)
const MODULE_ID = 6; // Assuming leads module will be ID 6

// Rate limiting for form submissions
const formRateLimit = FormValidationMiddleware.createRateLimit(15 * 60 * 1000, 10); // 10 requests per 15 minutes
const bulkImportRateLimit = FormValidationMiddleware.createRateLimit(60 * 60 * 1000, 3); // 3 requests per hour

/**
 * Facebook Lead Ads Webhook Routes
 * These routes handle Facebook webhook verification and lead data reception
 */

// GET /leads/webhook - Facebook webhook verification
// This endpoint is called by Facebook to verify the webhook URL
router.get('/webhook', LeadsController.verifyWebhook);

// POST /leads/webhook - Facebook webhook handler
// This endpoint receives lead data from Facebook Lead Ads
router.post('/webhook', LeadsController.handleFacebookWebhook);

/**
 * Website Form Lead Capture Routes
 * These routes handle lead capture from website forms and landing pages
 */

// Website form lead capture (public endpoint with validation and rate limiting)
router.post('/capture',
    FormValidationMiddleware.corsForForms,
    FormValidationMiddleware.securityHeaders,
    formRateLimit,
    FormValidationMiddleware.validateLeadForm,
    FormValidationMiddleware.validateUTMParameters,
    LeadsController.captureWebsiteLead
);

// Landing page lead capture (public endpoint with enhanced validation)
router.post('/landing-page',
    FormValidationMiddleware.corsForForms,
    FormValidationMiddleware.securityHeaders,
    formRateLimit,
    FormValidationMiddleware.validateLandingPageForm,
    FormValidationMiddleware.validateUTMParameters,
    LeadsController.captureLandingPageLead
);

// Bulk lead import (protected endpoint)
router.post('/bulk-import',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    bulkImportRateLimit,
    FormValidationMiddleware.validateBulkImport,
    LeadsController.bulkImportLeads
);

/**
 * Lead Management Routes
 * These routes require authentication and proper permissions
 */

// GET /leads/organisation/:organisationId - Get leads for an organisation
// Requires authentication and read permission for leads module
router.get('/organisation/:organisationId', 
    authenticateToken,
    checkModulePermission(MODULE_ID),
    LeadsController.getLeads
);

// GET /leads/:leadId - Get a specific lead by ID
// Requires authentication and read permission for leads module
router.get('/:leadId',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    LeadsController.getLeadById
);

// PUT /leads/:leadId/status - Update lead status
// Requires authentication and update permission for leads module
router.put('/:leadId/status',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    LeadsController.updateLeadStatus
);

/**
 * Additional Lead Management Routes (for future expansion)
 * These can be uncommented and implemented as needed
 */

/*
// POST /leads - Create a manual lead (for non-Facebook sources)
router.post('/',
    authenticateToken,
    checkPermission('leads', 'create'),
    LeadsController.createManualLead
);

// PUT /leads/:leadId - Update lead information
router.put('/:leadId',
    authenticateToken,
    checkPermission('leads', 'update'),
    LeadsController.updateLead
);

// DELETE /leads/:leadId - Delete a lead
router.delete('/:leadId',
    authenticateToken,
    checkPermission('leads', 'delete'),
    LeadsController.deleteLead
);

// GET /leads/stats/:organisationId - Get lead statistics
router.get('/stats/:organisationId',
    authenticateToken,
    checkPermission('leads', 'read'),
    LeadsController.getLeadStatistics
);

// POST /leads/:leadId/assign - Assign lead to a user
router.post('/:leadId/assign',
    authenticateToken,
    checkPermission('leads', 'update'),
    LeadsController.assignLead
);

// GET /leads/user/:userId - Get leads assigned to a specific user
router.get('/user/:userId',
    authenticateToken,
    checkPermission('leads', 'read'),
    LeadsController.getLeadsByUser
);

// POST /leads/bulk-update - Bulk update lead statuses
router.post('/bulk-update',
    authenticateToken,
    checkPermission('leads', 'update'),
    LeadsController.bulkUpdateLeads
);

// GET /leads/export/:organisationId - Export leads to CSV
router.get('/export/:organisationId',
    authenticateToken,
    checkPermission('leads', 'read'),
    LeadsController.exportLeads
);
*/

module.exports = router;