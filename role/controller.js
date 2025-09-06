const RoleModel = require('./model');

class RoleController {
    static async createRole(req, res) {
        try {
            const { name } = req.body;

            const roleId = await RoleModel.create(name);
            const role = await RoleModel.getById(roleId);

            return res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: role
            });
        } catch (error) {
            console.error('Create role error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Role with this name already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to create role'
            });
        }
    }

    static async getAllRoles(req, res) {
        try {
            const roles = await RoleModel.getAll();

            return res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('Get all roles error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch roles'
            });
        }
    }

    static async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const role = await RoleModel.getById(id);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: role
            });
        } catch (error) {
            console.error('Get role by id error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch role'
            });
        }
    }

    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const roleExists = await RoleModel.getById(id);
            if (!roleExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            await RoleModel.update(id, name);
            const updatedRole = await RoleModel.getById(id);

            return res.status(200).json({
                success: true,
                message: 'Role updated successfully',
                data: updatedRole
            });
        } catch (error) {
            console.error('Update role error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Role with this name already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to update role'
            });
        }
    }

    static async deleteRole(req, res) {
        try {
            const { id } = req.params;

            const roleExists = await RoleModel.getById(id);
            if (!roleExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            // Prevent deletion of superadmin role
            if (id === 1) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot delete superadmin role'
                });
            }

            await RoleModel.delete(id);

            return res.status(200).json({
                success: true,
                message: 'Role deleted successfully'
            });
        } catch (error) {
            console.error('Delete role error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete role'
            });
        }
    }
}

module.exports = RoleController;