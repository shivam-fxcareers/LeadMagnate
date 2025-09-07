const RolePermissionModel = require('./model');
const RoleModel = require('../role/model');
const ModuleModel = require('../modules/model');

class RolePermissionController {
    static async createRolePermission(req, res) {
        try {
            // Verify role exists
            const role = await RoleModel.getById(req.body.role_id);
            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }

            // Verify module exists
            const module = await ModuleModel.findById(req.body.module_id);
            if (!module) {
                return res.status(404).json({ error: 'Module not found' });
            }

            // Check if permission already exists
            const existingPermissions = await RolePermissionModel.getByRoleId(req.body.role_id);
            const permissionExists = existingPermissions.some(p => p.module_id === req.body.module_id);
            if (permissionExists) {
                return res.status(400).json({ error: 'Permission already exists for this role and module' });
            }

            const id = await RolePermissionModel.create(req.body);
            const permission = await RolePermissionModel.getById(id);
            res.status(201).json(permission);
        } catch (error) {
            console.error('Error creating role permission:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'Permission already exists for this role and module',
                    details: {
                        role_id: req.body.role_id,
                        module_id: req.body.module_id
                    }
                });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getAllRolePermissions(req, res) {
        try {
            const permissions = await RolePermissionModel.getAll();
            res.json(permissions);
        } catch (error) {
            console.error('Error getting role permissions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getRolePermissionById(req, res) {
        try {
            const permission = await RolePermissionModel.getById(req.params.id);
            if (!permission) {
                return res.status(404).json({ error: 'Role permission not found' });
            }
            res.json(permission);
        } catch (error) {
            console.error('Error getting role permission:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getRolePermissionsByRoleId(req, res) {
        try {
            const role = await RoleModel.getById(req.params.roleId);
            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }

            const permissions = await RolePermissionModel.getByRoleId(req.params.roleId);
            res.json(permissions);
        } catch (error) {
            console.error('Error getting role permissions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateRolePermission(req, res) {
        try {
            const permission = await RolePermissionModel.getById(req.params.id);
            if (!permission) {
                return res.status(404).json({ error: 'Role permission not found' });
            }

            if (req.body.role_id) {
                const role = await RoleModel.getById(req.body.role_id);
                if (!role) {
                    return res.status(404).json({ error: 'Role not found' });
                }
            }

            if (req.body.module_id) {
                const module = await ModuleModel.findById(req.body.module_id);
                if (!module) {
                    return res.status(404).json({ error: 'Module not found' });
                }
            }

            const success = await RolePermissionModel.update(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ error: 'Role permission not found' });
            }

            const updatedPermission = await RolePermissionModel.getById(req.params.id);
            res.json(updatedPermission);
        } catch (error) {
            console.error('Error updating role permission:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'Permission already exists for this role and module combination',
                    details: {
                        role_id: req.body.role_id,
                        module_id: req.body.module_id
                    }
                });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deleteRolePermission(req, res) {
        try {
            const success = await RolePermissionModel.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Role permission not found' });
            }
            res.status(200).json({ message: 'Role permission deleted successfully' });
        } catch (error) {
            console.error('Error deleting role permission:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = RolePermissionController;