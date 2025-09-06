const ModuleModel = require('./model');

class ModuleController {
  static async createModule(req, res) {
    try {
      const { name } = req.body;
      const moduleId = await ModuleModel.create(name);
      res.status(201).json({
        success: true,
        data: { id: moduleId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create module'
      });
    }
  }

  static async getAllModules(req, res) {
    try {
      const modules = await ModuleModel.findAll();
      res.json({
        success: true,
        data: modules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch modules'
      });
    }
  }

  static async getModuleById(req, res) {
    try {
      const { id } = req.params;
      const module = await ModuleModel.findById(id);
      
      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      res.json({
        success: true,
        data: module
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch module'
      });
    }
  }

  static async updateModule(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      const success = await ModuleModel.update(id, name);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      res.json({
        success: true,
        message: 'Module updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update module'
      });
    }
  }

  static async deleteModule(req, res) {
    try {
      const { id } = req.params;
      const success = await ModuleModel.delete(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete module'
      });
    }
  }


  static async attachModuleToOrganisation(req, res) {
    try {
      const { moduleId, organisationId } = req.body;

      // Check if module exists
      const module = await ModuleModel.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Check if already attached
      const isAttached = await ModuleModel.isModuleAttached(moduleId, organisationId);
      if (isAttached) {
        return res.status(400).json({
          success: false,
          error: 'Module is already attached to this organisation'
        });
      }

      await ModuleModel.attachToOrganisation(moduleId, organisationId);
      
      res.json({
        success: true,
        message: 'Module attached to organisation successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to attach module to organisation'
      });
    }
  }

  static async detachModuleFromOrganisation(req, res) {
    try {
      const { moduleId, organisationId } = req.body;

      // Check if module exists
      const module = await ModuleModel.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Check if actually attached
      const isAttached = await ModuleModel.isModuleAttached(moduleId, organisationId);
      if (!isAttached) {
        return res.status(400).json({
          success: false,
          error: 'Module is not attached to this organisation'
        });
      }

      await ModuleModel.detachFromOrganisation(moduleId, organisationId);
      
      res.json({
        success: true,
        message: 'Module detached from organisation successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to detach module from organisation'
      });
    }
  }

  static async getOrganisationModules(req, res) {
    try {
      const { organisationId } = req.params;
      const modules = await ModuleModel.getOrganisationModules(organisationId);
      
      res.json({
        success: true,
        data: modules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organisation modules'
      });
    }
  }
}

module.exports = ModuleController;