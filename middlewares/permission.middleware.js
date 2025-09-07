const { db } = require('../config/dbConfig');

// Map HTTP methods to permission actions
const METHOD_PERMISSION_MAP = {
    'GET': 'can_read',
    'POST': 'can_create',
    'PUT': 'can_update',
    'PATCH': 'can_update',
    'DELETE': 'can_delete'
};

const checkModulePermission = (moduleId) => {
    return async (req, res, next) => {
        try {
            // 1. Check if user exists and has organization
            const user = await db('users')
                .where('id', req.user.id)
                .first();

            if (!user || !user.organisation_id) {
                return res.status(403).json({
                    success: false,
                    message: 'User is not associated with any organization'
                });
            }

            // 2. Check if module is allowed for the organization
            const orgModule = await db('organisation_modules')
                .where({
                    organisation_id: user.organisation_id,
                    module_id: moduleId
                })
                .first();

            if (!orgModule) {
                return res.status(403).json({
                    success: false,
                    message: 'Organization does not have access to this module'
                });
            }

            // 3. Check role permissions
            const permissionAction = METHOD_PERMISSION_MAP[req.method];
            if (!permissionAction) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid HTTP method'
                });
            }

            const rolePermission = await db('role_permissions')
                .where({
                    role_id: user.role_id,
                    module_id: moduleId
                })
                .first();

            if (!rolePermission || !rolePermission[permissionAction]) {
                return res.status(403).json({
                    success: false,
                    message: `User's role does not have ${permissionAction.replace('can_', '')} permission for this module`
                });
            }

            // If scope is 'org', verify user belongs to the same organization as the resource
            if (rolePermission.scope === 'org' && req.params.organisation_id) {
                if (parseInt(req.params.organisation_id) !== user.organisation_id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied to resource outside your organization'
                    });
                }
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
};

module.exports = {
    checkModulePermission
};