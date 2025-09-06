# Lead Magnate

A comprehensive user and organization management system with role-based access control.

## Project Structure

```
├── auth/               # Authentication related files
├── config/             # Configuration files
├── middlewares/        # Custom middleware functions
├── modules/            # Module management
├── organisation/       # Organization management
├── utils/              # Utility functions
└── index.js           # Application entry point
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   - Create a MySQL database named `lead_magnate`
   - Import the schema from `lead_magnate.sql`

4. Start the server:
   ```bash
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### Sign Up
- **POST** `/api/auth/signup`
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "password": "string"
  }
  ```
- **Response**: 201 Created

#### Email Verification
- **POST** `/api/auth/verify-email`
- **Body**:
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Response**: 200 OK

#### Login
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: 200 OK with JWT token

#### Update Email
- **POST** `/api/auth/update-email`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "new_email": "string"
  }
  ```
- **Response**: 200 OK

### Organization Endpoints

#### Create Organization
- **POST** `/api/organisations`
- **Headers**: Authorization: Bearer {token}
- **Body**:
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
- **GET** `/api/organisations`
- **Headers**: Authorization: Bearer {token}
- **Response**: 200 OK

#### Get Organization by ID
- **GET** `/api/organisations/:id`
- **Headers**: Authorization: Bearer {token}
- **Response**: 200 OK

#### Update Organization
- **PUT** `/api/organisations/:id`
- **Headers**: Authorization: Bearer {token}
- **Body**: Same as Create Organization
- **Response**: 200 OK

### Module Endpoints

#### Create Module
- **POST** `/api/modules`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**: 201 Created

#### Get All Modules
- **GET** `/api/modules`
- **Headers**: Authorization: Bearer {token}
- **Response**: 200 OK

#### Get Module by ID
- **GET** `/api/modules/:id`
- **Headers**: Authorization: Bearer {token}
- **Response**: 200 OK

## Database Schema

### Users Table
- id (Primary Key)
- name
- email (Unique)
- phone (Unique)
- password
- is_verified
- organisation_id (Foreign Key)
- role_id (Foreign Key)
- created_at
- updated_at

### Organizations Table
- id (Primary Key)
- name
- legal_name
- registration_number (Unique)
- tax_id (Unique)
- industry
- website
- phone
- email (Unique)
- city
- state
- country
- logo_url
- created_at
- updated_at

### Modules Table
- id (Primary Key)
- name
- created_at
- updated_at

### Roles Table
- id (Primary Key)
- name (Unique)
- created_at
- updated_at

### OTPs Table
- id (Primary Key)
- otp
- user_id (Foreign Key)
- type
- created_at
- expires_at

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include:
```json
{
  "success": false,
  "message": "Error description"
}
```