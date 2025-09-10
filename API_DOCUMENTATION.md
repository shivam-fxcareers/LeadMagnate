# LeadMagnate API Documentation

Comprehensive API documentation for the LeadMagnate lead management system.

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "user_id": 123
}
```

### Login
**POST** `/auth/login`

**Description:** Authenticate user and get access token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "team_member",
    "organisation_id": 1
  }
}
```

### Verify Email
**POST** `/auth/verify-email`

**Description:** Verify user email with OTP

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

---

## Lead Management Endpoints

### Capture Website Lead
**POST** `/leads/capture-website-lead`

**Description:** Capture lead from website form submission

**Request Body:**
```json
{
  "email": "lead@example.com",
  "phone": "+919876543210",
  "first_name": "Jane",
  "last_name": "Smith",
  "full_name": "Jane Smith",
  "page_url": "https://example.com/contact",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer_sale",
  "custom_fields": {
    "company": "ABC Corp",
    "interest": "Product Demo"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "lead_id": 456,
  "lead_meta_id": 789,
  "assigned_to": {
    "user_id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Capture Landing Page Lead
**POST** `/leads/capture-landing-page-lead`

**Description:** Capture lead from landing page form

**Request Body:**
```json
{
  "email": "lead@example.com",
  "phone": "+919876543210",
  "first_name": "Jane",
  "last_name": "Smith",
  "page_url": "https://example.com/landing",
  "utm_source": "facebook",
  "utm_campaign": "lead_gen",
  "custom_fields": {
    "budget": "$10,000",
    "timeline": "3 months"
  }
}
```

### Facebook Webhook
**POST** `/leads/facebook-webhook`

**Description:** Receive leads from Facebook Lead Ads

**Headers:**
```
X-Hub-Signature-256: sha256=<signature>
```

**Request Body:** (Facebook webhook format)
```json
{
  "object": "page",
  "entry": [
    {
      "id": "page_id",
      "time": 1234567890,
      "changes": [
        {
          "value": {
            "leadgen_id": "lead_id",
            "page_id": "page_id",
            "form_id": "form_id",
            "adgroup_id": "ad_id",
            "campaign_id": "campaign_id",
            "created_time": 1234567890
          },
          "field": "leadgen"
        }
      ]
    }
  ]
}
```

### Bulk Import Leads
**POST** `/leads/bulk-import`

**Description:** Import multiple leads from CSV/Excel

**Request Body:** (multipart/form-data)
```
file: <csv_file>
organisation_id: 1
```

**CSV Format:**
```csv
email,phone,first_name,last_name,company,source
lead1@example.com,+919876543210,John,Doe,ABC Corp,website
lead2@example.com,+919876543211,Jane,Smith,XYZ Ltd,facebook
```

---

## Lead Assignment Endpoints

### Auto Assign Lead
**POST** `/assignments/auto-assign`

**Description:** Automatically assign leads using round-robin algorithm

**Request Body:**
```json
{
  "lead_ids": [456, 789, 101]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leads assigned successfully",
  "assignments": [
    {
      "lead_id": 456,
      "assigned_to": 123,
      "assigned_user_name": "John Doe",
      "assignment_id": 1001
    },
    {
      "lead_id": 789,
      "assigned_to": 124,
      "assigned_user_name": "Alice Johnson",
      "assignment_id": 1002
    }
  ]
}
```

### Manual Assign Lead
**POST** `/assignments/manual-assign`

**Description:** Manually assign lead to specific user

**Request Body:**
```json
{
  "lead_id": 456,
  "assigned_to": 123,
  "notes": "High priority lead - follow up within 24 hours"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead assigned successfully",
  "assignment": {
    "id": 1001,
    "lead_id": 456,
    "assigned_to": 123,
    "assigned_user_name": "John Doe",
    "assigned_at": "2025-01-15T10:30:00Z",
    "notes": "High priority lead - follow up within 24 hours"
  }
}
```

### Get Assignment History
**GET** `/assignments/history/:leadId`

**Description:** Get assignment history for a specific lead

**Parameters:**
- `leadId` (path): Lead ID

**Response:**
```json
{
  "success": true,
  "lead_id": 456,
  "assignment_history": [
    {
      "id": 1001,
      "assigned_to": 123,
      "assigned_user_name": "John Doe",
      "assigned_by": 100,
      "assigned_by_name": "Manager Smith",
      "assigned_at": "2025-01-15T10:30:00Z",
      "status": "active",
      "notes": "Initial assignment"
    }
  ]
}
```

### Get User Assignments
**GET** `/assignments/user/:userId`

**Description:** Get all assignments for a specific user

**Parameters:**
- `userId` (path): User ID
- `status` (query, optional): Filter by status (active, completed, cancelled)
- `limit` (query, optional): Number of results (default: 50)
- `offset` (query, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "user_id": 123,
  "assignments": [
    {
      "id": 1001,
      "lead_id": 456,
      "lead_name": "Jane Smith",
      "lead_email": "jane@example.com",
      "lead_phone": "+919876543210",
      "assigned_at": "2025-01-15T10:30:00Z",
      "status": "active",
      "lead_status": "new",
      "source": "website"
    }
  ],
  "total_count": 25,
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

### Get Assignment Statistics
**GET** `/assignments/stats`

**Description:** Get assignment statistics for the organization

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "organisation_id": 1,
  "date_range": {
    "from": "2025-01-01",
    "to": "2025-01-15"
  },
  "statistics": {
    "total_assignments": 150,
    "active_assignments": 45,
    "completed_assignments": 95,
    "cancelled_assignments": 10,
    "avg_completion_time_hours": 24.5,
    "team_members_count": 8
  }
}
```

### Bulk Reassign Leads
**POST** `/assignments/bulk-reassign`

**Description:** Reassign multiple leads to different users

**Request Body:**
```json
{
  "assignments": [
    {
      "lead_id": 456,
      "new_assigned_to": 124,
      "reason": "Workload balancing"
    },
    {
      "lead_id": 789,
      "new_assigned_to": 125,
      "reason": "Expertise match"
    }
  ]
}
```

### Get Team Members
**GET** `/assignments/team-members`

**Description:** Get all available team members for assignment

**Response:**
```json
{
  "success": true,
  "team_members": [
    {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "active_assignments": 5,
      "total_assignments": 25,
      "completion_rate": 85.5,
      "status": "active"
    }
  ]
}
```

### Get Load Balance
**GET** `/assignments/load-balance`

**Description:** Get current workload distribution among team members

**Response:**
```json
{
  "success": true,
  "load_balance": {
    "total_active_assignments": 45,
    "team_members": [
      {
        "user_id": 123,
        "name": "John Doe",
        "active_assignments": 8,
        "load_percentage": 17.8,
        "status": "balanced"
      }
    ],
    "balance_status": "good",
    "recommendations": []
  }
}
```

---

## Assignment Analytics Endpoints

### Get Assignment Analytics
**GET** `/assignments/analytics`

**Description:** Get comprehensive assignment analytics

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "organisation_id": 1,
  "date_range": {
    "from": "2025-01-01",
    "to": "2025-01-15"
  },
  "analytics": {
    "basic_stats": {
      "total_assignments": 150,
      "active_assignments": 45,
      "completed_assignments": 95,
      "cancelled_assignments": 10,
      "avg_completion_hours": 24.5,
      "active_team_members": 8
    },
    "team_performance": [
      {
        "user_id": 123,
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "total_assignments": 25,
        "completed_assignments": 20,
        "active_assignments": 5,
        "avg_completion_hours": 22.3,
        "completion_rate_percent": 80.0
      }
    ],
    "assignment_distribution": [
      {
        "source": "website",
        "assignment_count": 75,
        "percentage": 50.0
      },
      {
        "source": "facebook",
        "assignment_count": 60,
        "percentage": 40.0
      }
    ],
    "conversion_metrics": {
      "total_leads": 150,
      "converted_leads": 45,
      "lost_leads": 20,
      "new_leads": 85,
      "conversion_rate_percent": 30.0,
      "avg_days_to_convert": 7.5
    },
    "response_time_analytics": {
      "avg_assignment_delay_minutes": 2.5,
      "min_assignment_delay_minutes": 0.5,
      "max_assignment_delay_minutes": 15.0,
      "assignments_within_5min": 140,
      "assignments_within_15min": 148,
      "assignments_within_1hour": 150
    },
    "daily_trends": [
      {
        "assignment_date": "2025-01-15",
        "total_assignments": 12,
        "completed_assignments": 8,
        "active_team_members": 6,
        "avg_completion_hours": 18.5
      }
    ]
  }
}
```

### Get Workload Balance Report
**GET** `/assignments/analytics/workload-balance`

**Description:** Get detailed workload balance analysis

**Response:**
```json
{
  "success": true,
  "workload_balance": [
    {
      "user_id": 123,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "active_assignments": 8,
      "completed_today": 3,
      "overdue_assignments": 1,
      "avg_completion_hours_30d": 22.5
    }
  ],
  "generated_at": "2025-01-15T15:30:00Z"
}
```

### Generate Performance Report
**GET** `/assignments/analytics/performance-report`

**Description:** Generate detailed performance report

**Query Parameters:**
- `user_id` (optional): Specific user ID for individual report
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "report_type": "organisation",
  "organisation_id": 1,
  "user_id": null,
  "date_range": {
    "from": "2025-01-01",
    "to": "2025-01-15"
  },
  "generated_at": "2025-01-15T15:30:00Z",
  "data": {
    "analytics": "<comprehensive analytics data>"
  }
}
```

---

## Organization Management Endpoints

### Get Organizations
**GET** `/organisations`

**Description:** Get list of organizations (admin only)

**Response:**
```json
{
  "success": true,
  "organisations": [
    {
      "id": 1,
      "name": "Test Organisation",
      "legal_name": "Test Org Pvt Ltd",
      "industry": "Technology",
      "website": "https://testorg.com",
      "email": "contact@testorg.com",
      "phone": "+911234567890",
      "city": "Mumbai",
      "country": "India"
    }
  ]
}
```

### Create Organization
**POST** `/organisations`

**Description:** Create new organization (superadmin only)

**Request Body:**
```json
{
  "name": "New Company",
  "legal_name": "New Company Pvt Ltd",
  "industry": "Healthcare",
  "website": "https://newcompany.com",
  "email": "contact@newcompany.com",
  "phone": "+911234567890",
  "city": "Delhi",
  "state": "Delhi",
  "country": "India"
}
```

---

## Role Management Endpoints

### Get Roles
**GET** `/roles`

**Description:** Get list of available roles

**Response:**
```json
{
  "success": true,
  "roles": [
    {
      "id": 1,
      "name": "Superadmin"
    },
    {
      "id": 2,
      "name": "Org-admin"
    },
    {
      "id": 3,
      "name": "Manager"
    },
    {
      "id": 4,
      "name": "team_member"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
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

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (in development mode only)"
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Lead capture endpoints**: 100 requests per minute per organization
- **Assignment endpoints**: 50 requests per minute per user
- **Analytics endpoints**: 20 requests per minute per user

---

## Webhooks

### Facebook Lead Ads Webhook

**Endpoint:** `POST /leads/facebook-webhook`

**Verification:** The webhook includes signature verification using Facebook's X-Hub-Signature-256 header.

**Setup:**
1. Configure webhook URL in Facebook App settings
2. Set verify token in environment variables
3. Subscribe to `leadgen` events

---

## Testing

### Sample Test Data

For testing purposes, ensure the following sample data exists:

```sql
-- Add team_member role
INSERT INTO roles (name) VALUES ('team_member');

-- Add test team members
INSERT INTO users (name, email, phone, password, is_verified, organisation_id, role_id) VALUES
('Alice Johnson', 'alice@testorg.com', '+919876543212', '$2a$12$hashedpassword1', 1, 1, 4),
('Bob Smith', 'bob@testorg.com', '+919876543213', '$2a$12$hashedpassword2', 1, 1, 4);

-- Add lead statuses
INSERT INTO lead_statuses (name, description) VALUES
('new', 'New lead received'),
('qualified', 'Lead has been qualified'),
('contacted', 'Initial contact made'),
('won', 'Lead converted successfully'),
('lost', 'Lead lost or rejected');
```

### Postman Collection

A Postman collection with all endpoints and sample requests is available for testing.

---

## Environment Variables

Required environment variables:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lead_magnate
JWT_SECRET=your_jwt_secret
FACEBOOK_VERIFY_TOKEN=your_facebook_verify_token
FACEBOOK_APP_SECRET=your_facebook_app_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

---

## Support

For API support and questions:
- Email: support@leadmagnate.com
- Documentation: https://docs.leadmagnate.com
- GitHub Issues: https://github.com/leadmagnate/api/issues