const { db } = require('../config/dbConfig');

class ModuleModel {
  static tableName = 'modules';
  static modulesTableName = 'organisation_modules';

  static async create(name) {
    try {
      const [id] = await db(this.tableName)
        .insert({
          name
        });
      return id;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const modules = await db(this.tableName)
        .select('*');
      return modules;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const module = await db(this.tableName)
        .select('*')
        .where({ id })
        .first();
      return module;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  static async update(id, name) {
    try {
      const updated = await db(this.tableName)
        .where({ id })
        .update({
          name,
          updated_at: db.fn.now()
        });
      return updated > 0;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const deleted = await db(this.tableName)
        .where({ id })
        .delete();
      return deleted > 0;
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }


  static async attachToOrganisation(moduleId, organisationId) {
    try {
      const [id] = await db(this.modulesTableName)
        .insert({
          organisation_id: organisationId,
          module_id: moduleId
        });
      return id;
    } catch (error) {
      console.error('Error attaching module to organisation:', error);
      throw error;
    }
  }

  static async detachFromOrganisation(moduleId, organisationId) {
    try {
      const deleted = await db(this.modulesTableName)
        .where({
          organisation_id: organisationId,
          module_id: moduleId
        })
        .delete();
      return deleted > 0;
    } catch (error) {
      console.error('Error detaching module from organisation:', error);
      throw error;
    }
  }

  static async getOrganisationModules(organisationId) {
    try {
      const modules = await db(this.tableName)
        .select(`${this.tableName}.*`)
        .join(
          this.modulesTableName,
          `${this.tableName}.id`,
          `${this.modulesTableName}.module_id`
        )
        .where(`${this.modulesTableName}.organisation_id`, organisationId);
      return modules;
    } catch (error) {
      console.error('Error fetching organisation modules:', error);
      throw error;
    }
  }

  static async isModuleAttached(moduleId, organisationId) {
    try {
      const exists = await db(this.modulesTableName)
        .where({
          organisation_id: organisationId,
          module_id: moduleId
        })
        .first();
      return !!exists;
    } catch (error) {
      console.error('Error checking module attachment:', error);
      throw error;
    }
  }
}

module.exports = ModuleModel;