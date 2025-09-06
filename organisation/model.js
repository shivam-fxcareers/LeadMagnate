const { db } = require('../config/dbConfig');

class OrganisationModel {
    static async create(organisationData) {
        try {
            const [id] = await db('organisations').insert(organisationData);
            return await db('organisations').where('id', id).first();
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        try {
            return await db('organisations').select('*');
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            return await db('organisations').where('id', id).first();
        } catch (error) {
            throw error;
        }
    }

    static async update(id, organisationData) {
        try {
            await db('organisations').where('id', id).update(organisationData);
            return await db('organisations').where('id', id).first();
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await db('organisations').where('id', id).del();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrganisationModel;