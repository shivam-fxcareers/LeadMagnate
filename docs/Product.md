# Lead Magnate - Product Documentation

## Overview
Lead Magnate is a comprehensive user and organization management system with role-based access control (RBAC). It provides a secure and flexible platform for managing multiple organizations, users, roles, and permissions.

## Features

### 1. User Management
- User registration with email verification
- Secure authentication using JWT tokens
- User profile management
- Email update functionality with verification
- Password management

### 2. Organization Management
- Create and manage multiple organizations
- Detailed organization profiles including:
  - Legal information (name, registration number, tax ID)
  - Contact details (email, phone, website)
  - Location information (city, state, country)
  - Industry classification
  - Brand assets (logo)

### 3. Role-Based Access Control (RBAC)
- Predefined roles (Superadmin, Org-admin, Manager)
- Customizable role permissions
- Module-based access control
- Permission scopes (global/organization-level)
- Granular access control (create, read, update, delete)

### 4. Module Management
- Dynamic module registration
- Organization-specific module allocation
- Built-in modules:
  - Roles management
  - Organization management
  - User management
  - Permission management

## System Architecture

### Database Schema

#### Users Table
- Primary user information
- Organization and role associations
- Authentication details
- Account status tracking

#### Organizations Table
- Comprehensive organization details
- Unique identifiers (tax ID, registration number)
- Contact and location information

#### Roles Table
- Role definitions
- System-wide role management

#### Modules Table
- Available system modules
- Module tracking and management

#### Role Permissions Table
- Role-module permission mappings
- Granular permission controls
- Scope definitions

#### Organization Resources Table
- Organization-specific resource allocation
- Module access management

#### OTPs Table
- Temporary verification codes
- Email verification management

### Security Features

1. **Authentication**
   - JWT-based authentication
   - Token expiration management
   - Secure password hashing

2. **Authorization**
   - Role-based access control
   - Permission middleware
   - Scope-based restrictions

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - Cross-Origin Resource Sharing (CORS) protection

## Setup and Configuration

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd lead-magnate
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create MySQL database
   - Import schema from `lead_magnate.sql`

4. **Environment Configuration**
   Create `.env` file with the following variables:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASS=your_password
   DB_NAME=lead_magnate
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=24h
   ```

5. **Start Application**
   ```bash
   npm start
   ```

## Project Structure

```
├── auth/                 # Authentication related files
│   ├── controller.js     # Auth logic implementation
│   ├── model.js         # Auth data operations
│   └── routes.js        # Auth endpoints
├── config/              # Configuration files
│   └── dbConfig.js      # Database configuration
├── middlewares/         # Custom middleware functions
│   ├── auth.middleware.js    # Token verification
│   └── permission.middleware.js # Access control
├── modules/             # Module management
├── organisation/        # Organization management
├── role/               # Role management
├── role_permissions/   # Permission management
├── utils/              # Utility functions
└── index.js           # Application entry point
```

## Best Practices

### 1. Code Organization
- Modular architecture
- Separation of concerns
- Clear file naming conventions

### 2. Security
- Regular dependency updates
- Secure password storage
- Token-based authentication
- Input validation

### 3. Error Handling
- Consistent error responses
- Detailed error logging
- User-friendly error messages

### 4. Database
- Proper indexing
- Foreign key constraints
- Transaction management

## Maintenance and Support

### Regular Maintenance
1. Database backups
2. Log rotation
3. Security updates
4. Performance monitoring

### Troubleshooting
1. Check application logs
2. Verify database connectivity
3. Validate environment variables
4. Monitor server resources

## Future Enhancements

1. **Advanced Features**
   - Multi-factor authentication
   - Audit logging
   - Advanced reporting
   - User activity tracking

2. **Technical Improvements**
   - Caching implementation
   - Rate limiting
   - API versioning
   - Automated testing

3. **Security Enhancements**
   - Session management
   - IP whitelisting
   - Enhanced encryption
   - Security headers