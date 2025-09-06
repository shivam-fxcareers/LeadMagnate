const express = require('express');
const router = express.Router();
const RoleController = require('./controller');
const { authenticateToken, checkSuperAdmin, validateRequest } = require('../middlewares/auth.middleware');
const { z } = require('zod');

// Validation schemas
const createRoleSchema = z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters long').max(50, 'Role name cannot exceed 50 characters')
});

const updateRoleSchema = z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters long').max(50, 'Role name cannot exceed 50 characters')
});

const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// Routes - all require authentication and superadmin privileges
router.post('/', 
    authenticateToken,
    checkSuperAdmin,
    validateRequest(createRoleSchema),
    RoleController.createRole
);

router.get('/',
    authenticateToken,
    checkSuperAdmin,
    RoleController.getAllRoles
);

router.get('/:id',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(idParamSchema),
    RoleController.getRoleById
);

router.put('/',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(idParamSchema),
    validateRequest(updateRoleSchema),
    RoleController.updateRole
);

router.delete('/:id',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(idParamSchema),
    RoleController.deleteRole
);

module.exports = router;