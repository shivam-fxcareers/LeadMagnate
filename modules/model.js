const { db } = require('../config/dbConfig');

class ModuleModel {
  static tableName = 'modules';

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
}

module.exports = ModuleModel;