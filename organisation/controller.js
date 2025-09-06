const OrganisationModel = require('./model');

class OrganisationController {
    static async createOrganisation(req, res) {
        try {
            const organisation = await OrganisationModel.create(req.body);
            return res.status(201).json({
                success: true,
                message: 'Organisation created successfully',
                data: organisation
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Organisation with this registration number, tax ID, or email already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error creating organisation',
                error: error.message
            });
        }
    }

    static async getAllOrganisations(req, res) {
        try {
            const organisations = await OrganisationModel.findAll();
            return res.status(200).json({
                success: true,
                data: organisations
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching organisations',
                error: error.message
            });
        }
    }

    static async getOrganisationById(req, res) {
        try {
            const organisation = await OrganisationModel.findById(req.params.id);
            if (!organisation) {
                return res.status(404).json({
                    success: false,
                    message: 'Organisation not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: organisation
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching organisation',
                error: error.message
            });
        }
    }

    static async updateOrganisation(req, res) {
        try {
            const organisation = await OrganisationModel.findById(req.params.id);
            if (!organisation) {
                return res.status(404).json({
                    success: false,
                    message: 'Organisation not found'
                });
            }

            const updatedOrganisation = await OrganisationModel.update(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: 'Organisation updated successfully',
                data: updatedOrganisation
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Organisation with this registration number, tax ID, or email already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error updating organisation',
                error: error.message
            });
        }
    }

    static async deleteOrganisation(req, res) {
        try {
            const organisation = await OrganisationModel.findById(req.params.id);
            if (!organisation) {
                return res.status(404).json({
                    success: false,
                    message: 'Organisation not found'
                });
            }

            await OrganisationModel.delete(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Organisation deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting organisation',
                error: error.message
            });
        }
    }
}

module.exports = OrganisationController;