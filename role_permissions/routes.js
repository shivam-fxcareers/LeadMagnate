const express = require('express');
const { z } = require('zod');
const RolePermissionController = require('./controller');
const { validateRequest, authenticateToken, checkSuperAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

const createRolePermissionSchema = z.object({
    role_id: z.string().regex(/^\d+$/, 'Invalid role ID'),
    module_id: z.string().regex(/^\d+$/, 'Invalid module ID'),
    can_create: z.boolean().default(false),
    can_read: z.boolean().default(false),
    can_update: z.boolean().default(false),
    can_delete: z.boolean().default(false),
    scope: z.enum(['global', 'org']).default('org')
});

const updateRolePermissionSchema = createRolePermissionSchema.partial();

const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'Invalid role permission ID')
});

const roleIdParamSchema = z.object({
    roleId: z.string().regex(/^\d+$/, 'Invalid role ID')
});

// Create a new role permission
router.post('/',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(createRolePermissionSchema),
    RolePermissionController.createRolePermission
);

// Get all role permissions
router.get('/',
    authenticateToken,
    checkSuperAdmin,
    RolePermissionController.getAllRolePermissions
);

// Get a specific role permission
router.get('/:id',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(idParamSchema),
    RolePermissionController.getRolePermissionById
);

// Get all permissions for a specific role
router.get('/role/:roleId',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(roleIdParamSchema),
    RolePermissionController.getRolePermissionsByRoleId
);

// Update a role permission
router.put('/:id',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(idParamSchema),
    (req, res, next) => {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [{
                    field: 'body',
                    message: 'Request body is required'
                }]
            });
        }
        next();
    },
    validateRequest(updateRolePermissionSchema),
    RolePermissionController.updateRolePermission
);

// Delete a role permission
router.delete('/:id',
    authenticateToken,
    checkSuperAdmin,
    validateRequest(idParamSchema),
    RolePermissionController.deleteRolePermission
);

module.exports = router;