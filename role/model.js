const { db } = require('../config/dbConfig');

class RoleModel {
    static async create(name) {
        try {
            const [id] = await db('roles').insert({ name });
            return id;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const roles = await db('roles').select('*');
            return roles;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const role = await db('roles').where({ id }).first();
            return role;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, name) {
        try {
            const affected = await db('roles').where({ id }).update({ name });
            return affected > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const affected = await db('roles').where({ id }).del();
            return affected > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RoleModel;