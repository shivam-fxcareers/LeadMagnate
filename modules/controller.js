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
}

module.exports = ModuleController;