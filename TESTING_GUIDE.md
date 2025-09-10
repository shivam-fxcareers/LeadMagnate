# LeadMagnate CRM - Testing Guide

## Overview
This document provides comprehensive testing instructions for the LeadMagnate CRM system, including user roles, permissions, API endpoints, expected outcomes, and testing scenarios.

## System Architecture

### Database Current State
- **Users**: 3 users (1 Superadmin, 2 regular users)
- **Organizations**: 2 organizations
- **Roles**: 3 roles (Superadmin, Org-admin, Manager)
- **Modules**: 4 modules (roles, organisation, user, permission)
- **Permissions**: Superadmin has full access to all modules

### User Roles & Permissions

#### 1. Superadmin (Role ID: 1)
- **User**: Shiv SuperAdmin (shivam@fxcareer.com)
- **Organization**: Test Organisation (ID: 1)
- **Permissions**: Full CRUD access to ALL modules globally
- **Scope**: Global (can access all organizations)
- **Special Privileges**: Bypasses all permission checks

#### 2. Org-admin (Role ID: 2)
- **Current State**: No users assigned
- **Expected Permissions**: Organization-level admin access
- **Scope**: Organization-specific

#### 3. Manager (Role ID: 3)
- **Current State**: No users assigned
- **Expected Permissions**: Limited module access within organization
- **Scope**: Organization-specific

#### 4. Unassigned Users
- **John Doe** (shivamw71@gmail.com) - Verified, no role/org
- **John Doe** (shivamw711@gmail.com) - Unverified, no role/org

## API Endpoints & Testing

### Base URL
```
http://localhost:3000/api
```

### 1. Authentication Endpoints (`/auth`)

#### 1.1 User Registration
**Endpoint**: `POST /auth/signup`

**Test Cases**:
```json
// Valid Registration
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+919876543212",
  "password": "password123"
}
```

**Expected Outcomes**:
- ✅ Success: 201 Created, OTP sent to email
- ❌ Duplicate email: 400 Bad Request
- ❌ Duplicate phone: 400 Bad Request

#### 1.2 Email Verification
**Endpoint**: `POST /auth/verify-email`

**Test Cases**:
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Expected Outcomes**:
- ✅ Valid OTP: 200 OK, user verified
- ❌ Invalid/Expired OTP: 400 Bad Request

#### 1.3 User Login
**Endpoint**: `POST /auth/login`

**Test Cases**:
```json
// Superadmin Login
{
  "email": "shivam@fxcareer.com",
  "password": "[actual_password]"
}

// Regular User Login
{
  "email": "shivamw71@gmail.com",
  "password": "[actual_password]"
}
```

**Expected Outcomes**:
- ✅ Valid credentials + verified: 200 OK with JWT token and user data
- ❌ Invalid credentials: 401 Unauthorized
- ❌ Unverified user: 401 Unauthorized

#### 1.4 Password Reset
**Endpoints**: 
- `POST /auth/request-password-change`
- `POST /auth/verify-password-change`

**Test Cases**:
```json
// Request Reset
{
  "email": "shivam@fxcareer.com"
}

// Verify Reset
{
  "email": "shivam@fxcareer.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

### 2. Organization Management (`/organisations`)

**Authentication Required**: Bearer Token
**Permission Required**: Module ID 3 (organisation)

#### 2.1 Create Organization
**Endpoint**: `POST /organisations`

**Test Cases**:
```json
{
  "name": "New Company",
  "legal_name": "New Company Pvt Ltd",
  "registration_number": "REG456",
  "tax_id": "TAX456",
  "industry": "Software",
  "website": "https://newcompany.com",
  "phone": "+919876543213",
  "email": "contact@newcompany.com",
  "city": "Delhi",
  "state": "Delhi",
  "country": "India"
}
```

**Who Can Test**:
- ✅ Superadmin: Full access
- ❌ Unassigned users: 403 Forbidden (no role/org)
- ❌ Users without org module permission: 403 Forbidden

#### 2.2 Get Organizations
**Endpoints**: 
- `GET /organisations` (all)
- `GET /organisations/:id` (specific)

**Expected Outcomes by User Type**:
- **Superadmin**: Can view all organizations
- **Org-admin**: Can view only their organization (if properly configured)
- **Unassigned users**: 403 Forbidden

### 3. Role Management (`/roles`)

**Authentication Required**: Bearer Token
**Permission Required**: Module ID 2 (roles)

#### 3.1 Role Operations
**Endpoints**:
- `POST /roles` - Create role
- `GET /roles` - Get all roles
- `GET /roles/:id` - Get specific role
- `PUT /roles` - Update role
- `DELETE /roles/:id` - Delete role

**Test Cases**:
```json
// Create Role
{
  "name": "Sales Manager"
}

// Update Role
{
  "id": 4,
  "name": "Senior Sales Manager"
}
```

**Who Can Test**:
- ✅ Superadmin: Full CRUD access
- ❌ Others: 403 Forbidden (no permissions set)

### 4. Module Management (`/modules`)

**Authentication Required**: Bearer Token
**Permission Required**: Module ID 2 (roles) - Note: This seems to be a configuration issue

#### 4.1 Module Operations
**Endpoints**:
- `POST /modules` - Create module
- `GET /modules` - Get all modules
- `GET /modules/:id` - Get specific module
- `PUT /modules/:id` - Update module
- `DELETE /modules/:id` - Delete module
- `POST /modules/attach` - Attach module to organization
- `POST /modules/detach` - Detach module from organization
- `GET /modules/organisation/:organisationId` - Get org modules

**Test Cases**:
```json
// Create Module
{
  "name": "leads"
}

// Attach Module to Organization
{
  "moduleId": 6,
  "organisationId": 1
}
```

### 5. Role Permissions (`/role-permissions`)

**Authentication Required**: Bearer Token
**Permission Required**: Module ID 5 (permission)

#### 5.1 Permission Operations
**Endpoints**:
- `POST /role-permissions` - Create permission
- `GET /role-permissions` - Get all permissions
- `GET /role-permissions/:id` - Get specific permission
- `GET /role-permissions/role/:roleId` - Get permissions by role
- `PUT /role-permissions/:id` - Update permission
- `DELETE /role-permissions/:id` - Delete permission

**Test Cases**:
```json
// Create Permission
{
  "role_id": "2",
  "module_id": "3",
  "can_create": true,
  "can_read": true,
  "can_update": true,
  "can_delete": false,
  "scope": "org"
}
```

## Testing Scenarios

### Scenario 1: Superadmin Full Access Test
**User**: shivam@fxcareer.com
**Expected**: Full access to all endpoints

1. Login as Superadmin
2. Test all CRUD operations on all modules
3. Verify global scope access
4. Create new organizations, roles, modules, permissions

### Scenario 2: Unassigned User Access Test
**User**: shivamw71@gmail.com
**Expected**: Access denied to all protected endpoints

1. Login as unassigned user
2. Attempt to access any protected endpoint
3. Verify 403 Forbidden responses

### Scenario 3: Permission System Test
**Setup Required**: Assign role and organization to a user

1. Create new role with specific permissions
2. Assign user to organization and role
3. Test access based on assigned permissions
4. Verify scope restrictions (org vs global)

### Scenario 4: Organization Module Access Test
**Setup Required**: Configure organization-module relationships

1. Attach/detach modules from organizations
2. Test user access based on organization's allowed modules
3. Verify permission inheritance

## Common HTTP Status Codes

- **200 OK**: Successful GET/PUT requests
- **201 Created**: Successful POST requests
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate entry (e.g., existing permission)
- **500 Internal Server Error**: Server-side errors

## Testing Tools

### Recommended Tools:
1. **Postman**: For API testing with collections
2. **curl**: For command-line testing
3. **Thunder Client** (VS Code): For integrated testing

### Sample Postman Collection Structure:
```
LeadMagnate API Tests/
├── Authentication/
│   ├── Signup
│   ├── Verify Email
│   ├── Login (Superadmin)
│   ├── Login (Regular User)
│   └── Password Reset
├── Organizations/
│   ├── Create Organization
│   ├── Get All Organizations
│   └── Get Organization by ID
├── Roles/
├── Modules/
└── Permissions/
```

## Environment Variables Required

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lead_magnate
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Known Issues & Limitations

1. **Module Permission Inconsistency**: Module management uses role module ID (2) instead of dedicated module ID
2. **Organization-Module Relationship**: `organisation_modules` table referenced but not fully implemented
3. **No Input Validation**: All request validation has been removed
4. **Unassigned Users**: Users without roles/organizations have no access to any resources

## Security Considerations

1. **JWT Token**: Include in Authorization header as `Bearer <token>`
2. **Password Security**: Passwords are hashed using bcrypt
3. **OTP Expiry**: OTPs expire after 15 minutes
4. **Role-Based Access**: Strict permission checking for all operations
5. **Superadmin Bypass**: Superadmin role bypasses all permission checks

## Troubleshooting

### Common Issues:
1. **403 Forbidden**: Check user role and permissions
2. **401 Unauthorized**: Verify JWT token and user verification status
3. **400 Bad Request**: Check request body format and required fields
4. **500 Internal Server Error**: Check database connection and server logs

### Debug Steps:
1. Verify database connection
2. Check user authentication status
3. Validate role and organization assignments
4. Review permission configurations
5. Check server console for detailed error logs