const express = require('express');
const ModuleController = require('./controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkModulePermission } = require('../middlewares/permission.middleware');

// Define module ID for modules management
const MODULE_ID = 2; // ID from modules table for 'roles' module

const router = express.Router();

// Create a new module
router.post('/',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.createModule
);

// Get all modules
router.get('/',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.getAllModules
);

// Get a specific module
router.get('/:id',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.getModuleById
);

// Update a module
router.put('/:id',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.updateModule
);

// Delete a module
router.delete('/:id',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.deleteModule
);

// Attach a module to an organisation
router.post('/attach',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.attachModuleToOrganisation
);

// Detach a module from an organisation
router.post('/detach',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.detachModuleFromOrganisation
);

// Get all modules for an organisation
router.get('/organisation/:organisationId',
  authenticateToken,
  checkModulePermission(MODULE_ID),
  ModuleController.getOrganisationModules
);

module.exports = router;