const express = require('express');
const OrganisationController = require('./controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkModulePermission } = require('../middlewares/permission.middleware');

// Define module ID for organisation management
const MODULE_ID = 3; // ID from modules table for 'organisations' module

const router = express.Router();

// Create a new organisation
router.post('/',
    authenticateToken,
    checkModulePermission(MODULE_ID),
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
    OrganisationController.getOrganisationById
);

// Update an organisation
router.put('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    OrganisationController.updateOrganisation
);

// Delete an organisation
router.delete('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    OrganisationController.deleteOrganisation
);

module.exports = router;