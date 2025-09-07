const express = require('express');
const { z } = require('zod');
const OrganisationController = require('./controller');
const { validateRequest, authenticateToken } = require('../middlewares/auth.middleware');
const { checkModulePermission } = require('../middlewares/permission.middleware');

// Define module ID for organisation management
const MODULE_ID = 3; // ID from modules table for 'organisations' module

const router = express.Router();

const createOrganisationSchema = z.object({
    name: z.string().min(1, 'Organisation name is required').max(100, 'Organisation name must be less than 100 characters'),
    legal_name: z.string().max(150, 'Legal name must be less than 150 characters').optional(),
    registration_number: z.string().max(100, 'Registration number must be less than 100 characters').optional(),
    tax_id: z.string().max(100, 'Tax ID must be less than 100 characters').optional(),
    industry: z.string().max(100, 'Industry must be less than 100 characters').optional(),
    website: z.string().url('Invalid website URL').max(150, 'Website URL must be less than 150 characters').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,19}$/, 'Invalid phone number format').max(20, 'Phone number must be less than 20 characters').optional(),
    email: z.string().email('Invalid email format').max(150, 'Email must be less than 150 characters').optional(),
    city: z.string().max(100, 'City must be less than 100 characters').optional(),
    state: z.string().max(100, 'State must be less than 100 characters').optional(),
    country: z.string().max(100, 'Country must be less than 100 characters').optional(),
    logo_url: z.string().url('Invalid logo URL').max(255, 'Logo URL must be less than 255 characters').optional()
});

const updateOrganisationSchema = createOrganisationSchema;

const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'Invalid organisation ID')
});

// Create a new organisation
router.post('/',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    validateRequest(createOrganisationSchema),
    OrganisationController.createOrganisation
);

// Get all organisations
router.get('/',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    OrganisationController.getAllOrganisations
);

// Get a specific organisation
router.get('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    validateRequest(idParamSchema),
    OrganisationController.getOrganisationById
);

// Update an organisation
router.put('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    validateRequest(idParamSchema.merge(updateOrganisationSchema)),
    OrganisationController.updateOrganisation
);

// Delete an organisation
router.delete('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    validateRequest(idParamSchema),
    OrganisationController.deleteOrganisation
);

module.exports = router;