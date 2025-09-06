const db = require('../config/dbConfig');

class RoleModel {
    static async create(name) {
        try {
            const [result] = await db.execute(
                'INSERT INTO roles (name) VALUES (?)',
                [name]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const [roles] = await db.execute('SELECT * FROM roles');
            return roles;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const [roles] = await db.execute(
                'SELECT * FROM roles WHERE id = ?',
                [id]
            );
            return roles[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id, name) {
        try {
            const [result] = await db.execute(
                'UPDATE roles SET name = ? WHERE id = ?',
                [name, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM roles WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RoleModel;