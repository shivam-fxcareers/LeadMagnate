const express = require('express');
const RolePermissionController = require('./controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkModulePermission } = require('../middlewares/permission.middleware');

// Define module ID for role permissions
const MODULE_ID = 5; // ID from modules table for 'permission' module

const router = express.Router();

// Create a new role permission
router.post('/',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RolePermissionController.createRolePermission
);

// Get all role permissions
router.get('/',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RolePermissionController.getAllRolePermissions
);

// Get a specific role permission
router.get('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RolePermissionController.getRolePermissionById
);

// Get all permissions for a specific role
router.get('/role/:roleId',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RolePermissionController.getRolePermissionsByRoleId
);

// Update a role permission
router.put('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RolePermissionController.updateRolePermission
);

// Delete a role permission
router.delete('/:id',
    authenticateToken,
    checkModulePermission(MODULE_ID),
    RolePermissionController.deleteRolePermission
);

module.exports = router;