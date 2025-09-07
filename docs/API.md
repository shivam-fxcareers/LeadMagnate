# Lead Magnate API Documentation

## Base URL
`/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Sign Up
- **POST** `/auth/signup`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "password": "string"
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "success": true,
    "message": "User created successfully"
  }
  ```

#### Email Verification
- **POST** `/auth/verify-email`
- **Description**: Verify user's email with OTP
- **Request Body**:
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```

#### Login
- **POST** `/auth/login`
- **Description**: Authenticate user and get access token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "number",
        "name": "string",
        "email": "string",
        "organisation": "string",
        "role": "string"
      },
      "token": "string",
      "expiresAt": "string",
      "modules": [{
        "id": "number",
        "name": "string",
        "permissions": {
          "create": "boolean",
          "read": "boolean",
          "update": "boolean",
          "delete": "boolean"
        },
        "scope": "string"
      }]
    }
  }
  ```

#### Update Email
- **POST** `/auth/update-email`
- **Protected**: Yes
- **Description**: Request email update for authenticated user
- **Request Body**:
  ```json
  {
    "new_email": "string"
  }
  ```
- **Response**: 200 OK

### Organizations

#### Create Organization
- **POST** `/organisations`
- **Protected**: Yes
- **Description**: Create a new organization
- **Request Body**:
  ```json
  {
    "name": "string",
    "legal_name": "string",
    "registration_number": "string",
    "tax_id": "string",
    "industry": "string",
    "website": "string",
    "phone": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "logo_url": "string"
  }
  ```
- **Response**: 201 Created

#### Get All Organizations
- **GET** `/organisations`
- **Protected**: Yes
- **Description**: Retrieve all organizations (filtered by permissions)
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "data": [{
      "id": "number",
      "name": "string",
      "legal_name": "string",
      "registration_number": "string",
      "tax_id": "string",
      "industry": "string",
      "website": "string",
      "phone": "string",
      "email": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "logo_url": "string"
    }]
  }
  ```

#### Get Organization by ID
- **GET** `/organisations/:id`
- **Protected**: Yes
- **Description**: Retrieve organization details by ID
- **Response**: 200 OK

#### Update Organization
- **PUT** `/organisations/:id`
- **Protected**: Yes
- **Description**: Update organization details
- **Request Body**: Same as Create Organization
- **Response**: 200 OK

### Modules

#### Create Module
- **POST** `/modules`
- **Protected**: Yes
- **Description**: Create a new module
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**: 201 Created

#### Get All Modules
- **GET** `/modules`
- **Protected**: Yes
- **Description**: Retrieve all modules
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "data": [{
      "id": "number",
      "name": "string",
      "created_at": "string",
      "updated_at": "string"
    }]
  }
  ```

#### Get Module by ID
- **GET** `/modules/:id`
- **Protected**: Yes
- **Description**: Retrieve module details by ID
- **Response**: 200 OK

### Role Permissions

#### Create/Update Role Permission
- **POST** `/role-permissions`
- **Protected**: Yes
- **Description**: Assign permissions to a role for a module
- **Request Body**:
  ```json
  {
    "role_id": "number",
    "module_id": "number",
    "can_create": "boolean",
    "can_read": "boolean",
    "can_update": "boolean",
    "can_delete": "boolean",
    "scope": "string"
  }
  ```
- **Response**: 201 Created

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```