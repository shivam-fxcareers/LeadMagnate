const express = require('express');
const UserController = require('./controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkModulePermission } = require('../middlewares/permission.middleware');
const { validateUserCreation, validateUserUpdate } = require('./validation');

const MODULE_ID = 7; // ID from modules table for 'users' module

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /users
 * @desc Get all users with filtering and pagination
 * @access Private (requires VIEW_USERS permission)
 */
router.get('/', 
    checkModulePermission(MODULE_ID),
    UserController.getAllUsers
);

/**
 * @route GET /users/unassigned
 * @desc Get unassigned users
 * @access Private (requires VIEW_USERS permission)
 */
router.get('/unassigned',
    checkModulePermission(MODULE_ID),
    UserController.getUnassignedUsers
);

/**
 * @route GET /users/profile
 * @desc Get current user profile
 * @access Private (authenticated user)
 */
router.get('/profile',
    UserController.getUserProfile
);

/**
 * @route PUT /users/profile
 * @desc Update current user profile
 * @access Private (authenticated user)
 */
router.put('/profile',
    UserController.updateUserProfile
);

/**
 * @route GET /users/organisation/:organisationId
 * @desc Get users by organization
 * @access Private (requires VIEW_USERS permission)
 */
router.get('/organisation/:organisationId',
    checkModulePermission(MODULE_ID),
    UserController.getUsersByOrganisation
);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 * @access Private (requires VIEW_USERS permission)
 */
router.get('/:id',
    checkModulePermission(MODULE_ID),
    UserController.getUserById
);

/**
 * @route POST /users
 * @desc Create new user
 * @access Private (requires CREATE_USERS permission)
 */
router.post('/',
    checkModulePermission(MODULE_ID),
    validateUserCreation,
    UserController.createUser
);

/**
 * @route PUT /users/:id
 * @desc Update user information
 * @access Private (requires UPDATE_USERS permission)
 */
router.put('/:id',
    checkModulePermission(MODULE_ID),
    validateUserUpdate,
    UserController.updateUser
);

/**
 * @route DELETE /users/:id
 * @desc Delete user (soft delete)
 * @access Private (requires DELETE_USERS permission)
 */
router.delete('/:id',
    checkModulePermission(MODULE_ID),
    UserController.deleteUser
);

/**
 * @route POST /users/:id/assign-organisation
 * @desc Assign user to organization
 * @access Private (requires ASSIGN_USERS permission)
 */
router.post('/:id/assign-organisation',
    checkModulePermission(MODULE_ID),
    UserController.assignUserToOrganisation
);

/**
 * @route DELETE /users/:id/remove-organisation
 * @desc Remove user from organization
 * @access Private (requires ASSIGN_USERS permission)
 */
router.delete('/:id/remove-organisation',
    checkModulePermission(MODULE_ID),
    UserController.removeUserFromOrganisation
);

/**
 * @route POST /users/:id/assign-role
 * @desc Assign role to user
 * @access Private (requires ASSIGN_ROLES permission)
 */
router.post('/:id/assign-role',
    checkModulePermission(MODULE_ID),
    UserController.assignRoleToUser
);

/**
 * @route DELETE /users/:id/remove-role
 * @desc Remove role from user
 * @access Private (requires ASSIGN_ROLES permission)
 */
router.delete('/:id/remove-role',
    checkModulePermission(MODULE_ID),
    UserController.removeRoleFromUser
);

/**
 * @route POST /users/:id/reset-password
 * @desc Reset user password
 * @access Private (requires RESET_PASSWORDS permission)
 */
router.post('/:id/reset-password',
    checkModulePermission(MODULE_ID),
    UserController.resetUserPassword
);

/**
 * @route POST /users/invite
 * @desc Invite user
 * @access Private (requires CREATE_USERS permission)
 */
router.post('/invite',
    checkModulePermission(MODULE_ID),
    UserController.inviteUser
);

/**
 * @route GET /users/invitation/:token
 * @desc Get invitation details
 * @access Public
 */
router.get('/invitation/:token',
    UserController.getInvitation
);

/**
 * @route POST /users/accept-invitation
 * @desc Accept invitation
 * @access Public
 */
router.post('/accept-invitation',
    UserController.acceptInvitation
);

/**
 * @route GET /users/invitations
 * @desc Get pending invitations
 * @access Private (requires VIEW_USERS permission)
 */
router.get('/invitations',
    checkModulePermission(MODULE_ID),
    UserController.getPendingInvitations
);

/**
 * @route DELETE /users/invitations/:id
 * @desc Cancel invitation
 * @access Private (requires DELETE_USERS permission)
 */
router.delete('/invitations/:id',
    checkModulePermission(MODULE_ID),
    UserController.cancelInvitation
);

/**
 * @route POST /users/invitations/:id/resend
 * @desc Resend invitation
 * @access Private (requires CREATE_USERS permission)
 */
router.post('/invitations/:id/resend',
    checkModulePermission(MODULE_ID),
    UserController.resendInvitation
);

module.exports = router;