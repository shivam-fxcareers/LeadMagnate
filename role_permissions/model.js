const { db } = require('../config/dbConfig');

class RolePermissionModel {
    static async checkExistingPermission(roleId, moduleId, excludeId = null) {
        try {
            const query = db('role_permissions')
                .where({
                    role_id: roleId,
                    module_id: moduleId
                });

            if (excludeId) {
                query.whereNot('id', excludeId);
            }

            const existing = await query.first();
            return existing;
        } catch (error) {
            throw error;
        }
    }

    static async create(rolePermission) {
        try {
            // Check for existing permission
            const existing = await this.checkExistingPermission(
                rolePermission.role_id,
                rolePermission.module_id
            );
            if (existing) {
                const error = new Error('Permission already exists for this role and module, Please chose modify permission');
                error.code = 'ER_DUP_ENTRY';
                throw error;
            }

            const [id] = await db('role_permissions').insert({
                role_id: rolePermission.role_id,
                module_id: rolePermission.module_id,
                can_create: rolePermission.can_create,
                can_read: rolePermission.can_read,
                can_update: rolePermission.can_update,
                can_delete: rolePermission.can_delete,
                scope: rolePermission.scope || 'org'
            });
            return id;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const permissions = await db('role_permissions')
                .select('*')
                .join('roles', 'role_permissions.role_id', 'roles.id')
                .join('modules', 'role_permissions.module_id', 'modules.id')
                .select(
                    'role_permissions.*',
                    'roles.name as role_name',
                    'modules.name as module_name'
                );
            return permissions;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const permission = await db('role_permissions')
                .where('role_permissions.id', id)
                .join('roles', 'role_permissions.role_id', 'roles.id')
                .join('modules', 'role_permissions.module_id', 'modules.id')
                .select(
                    'role_permissions.*',
                    'roles.name as role_name',
                    'modules.name as module_name'
                )
                .first();
            return permission;
        } catch (error) {
            throw error;
        }
    }

    static async getByRoleId(roleId) {
        try {
            const permissions = await db('role_permissions')
                .where('role_permissions.role_id', roleId)
                .join('roles', 'role_permissions.role_id', 'roles.id')
                .join('modules', 'role_permissions.module_id', 'modules.id')
                .select(
                    'role_permissions.*',
                    'roles.name as role_name',
                    'modules.name as module_name'
                );
            return permissions;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, rolePermission) {
        try {
            // Only check for duplicates if role_id or module_id is being changed
            const currentPermission = await this.getById(id);
            if (!currentPermission) {
                throw new Error('Role permission not found');
            }

            // If either role_id or module_id is different from current values
            if ((rolePermission.role_id && rolePermission.role_id !== currentPermission.role_id) ||
                (rolePermission.module_id && rolePermission.module_id !== currentPermission.module_id)) {
                const existing = await this.checkExistingPermission(
                    rolePermission.role_id || currentPermission.role_id,
                    rolePermission.module_id || currentPermission.module_id,
                    id
                );
                if (existing) {
                    const error = new Error('Cannot update: A permission already exists for the specified role and module combination. Please modify the existing permission instead.');
                    error.code = 'ER_DUP_ENTRY';
                    throw error;
                }
            }

            const affected = await db('role_permissions')
                .where({ id })
                .update({
                    role_id: rolePermission.role_id,
                    module_id: rolePermission.module_id,
                    can_create: rolePermission.can_create,
                    can_read: rolePermission.can_read,
                    can_update: rolePermission.can_update,
                    can_delete: rolePermission.can_delete,
                    scope: rolePermission.scope || 'org'
                });
            return affected > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const affected = await db('role_permissions').where({ id }).del();
            return affected > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RolePermissionModel;