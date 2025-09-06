const express = require('express');
const { z } = require('zod');
const ModuleController = require('./controller');
const { validateRequest, authenticateToken, checkSuperAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

const createModuleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Module name is required').max(100, 'Module name must be less than 100 characters')
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const updateModuleSchema = createModuleSchema;

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid module ID')
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// Create a new module
router.post('/',
  authenticateToken,
  checkSuperAdmin,
  validateRequest(createModuleSchema),
  ModuleController.createModule
);

// Get all modules
router.get('/',
  authenticateToken,
  checkSuperAdmin,
  ModuleController.getAllModules
);

// Get a specific module
router.get('/:id',
  authenticateToken,
  checkSuperAdmin,
  validateRequest(idParamSchema),
  ModuleController.getModuleById
);

// Update a module
router.put('/:id',
  authenticateToken,
  checkSuperAdmin,
  validateRequest(idParamSchema.merge(updateModuleSchema)),
  ModuleController.updateModule
);

// Delete a module
router.delete('/:id',
  authenticateToken,
  checkSuperAdmin,
  validateRequest(idParamSchema),
  ModuleController.deleteModule
);

module.exports = router;