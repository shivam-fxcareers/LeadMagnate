const express = require('express');
const router = express.Router();
const RoleController = require('./controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkModulePermission } = require('../middlewares/permission.middleware');

// Define module ID for roles management
const MODULE_ID = 2; // ID from modules table for 'roles' module

// Routes - all require authentication and superadmin privileges
router.post('/', 
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RoleController.createRole
);

router.get('/',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RoleController.getAllRoles
);

router.get('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RoleController.getRoleById
);

router.put('/',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RoleController.updateRole
);

router.delete('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RoleController.deleteRole
);

module.exports = router;