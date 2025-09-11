# LeadMagnate API Testing Manual

## Overview
This comprehensive testing manual provides step-by-step instructions to test all LeadMagnate API endpoints systematically. The testing follows a logical flow from system setup to complete lead management workflow.

## Prerequisites
- Postman installed with LeadMagnate collection imported
- LeadMagnate server running (typically on http://localhost:3000)
- Database properly set up with sample data
- Environment variables configured in Postman

## Environment Setup

### Postman Environment Variables
Set these variables in your Postman environment:
```
base_url: http://localhost:3000
auth_token: (will be set automatically after login)
user_id: (will be set automatically after login)
organisation_id: (will be set automatically after login)
invitation_token: (for invitation testing)
```

---

## Phase 1: System Administration & Setup

### 1.1 Super Admin Account Setup

#### Test 1: Super Admin Login
**Endpoint:** `POST {{base_url}}/auth/login`

**Request Body:**
```json
{
  "email": "shivam@fxcareer.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Shiv SuperAdmin",
    "email": "shivam@fxcareer.com",
    "role": "Superadmin",
    "organisation_id": 1
  }
}
```

**Verification Steps:**
- ✅ Status code should be 200
- ✅ Response contains valid JWT token
- ✅ User role is "Superadmin"
- ✅ Token is automatically saved to environment

---

### 1.2 Organization Management

#### Test 2: Create New Test Organization
**Endpoint:** `POST {{base_url}}/organisations`

**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Testing Corp",
  "legal_name": "Testing Corporation Pvt Ltd",
  "registration_number": "REG2025001",
  "tax_id": "TAX2025001",
  "industry": "Software Testing",
  "website": "https://testingcorp.com",
  "phone": "+919876543299",
  "email": "admin@testingcorp.com",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Organisation created successfully",
  "organisation": {
    "id": 4,
    "name": "Testing Corp",
    "legal_name": "Testing Corporation Pvt Ltd",
    "industry": "Software Testing",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Verification Steps:**
- ✅ Status code should be 201
- ✅ Organization created with unique ID
- ✅ All provided details are saved correctly

#### Test 3: Get All Organizations
**Endpoint:** `GET {{base_url}}/organisations`

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "organisations": [
    {
      "id": 1,
      "name": "Test Organisation",
      "industry": "Technology"
    },
    {
      "id": 4,
      "name": "Testing Corp",
      "industry": "Software Testing"
    }
  ]
}
```

---

### 1.3 User Management & Role Assignment

#### Test 4: Send User Invitation (Org Admin)
**Endpoint:** `POST {{base_url}}/users/invite`

**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "orgadmin@testingcorp.com",
  "organisation_id": 4,
  "role_id": 2
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitation": {
    "id": 1,
    "email": "orgadmin@testingcorp.com",
    "expires_at": "2025-01-22T15:30:00Z"
  }
}
```

**Note:** Save the invitation token from email/logs for next step.

#### Test 5: Accept Invitation (Create Org Admin)
**Endpoint:** `POST {{base_url}}/users/accept-invitation`

**Request Body:**
```json
{
  "token": "{{invitation_token}}",
  "name": "Testing Corp Admin",
  "phone": "+919876543298",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Invitation accepted successfully. Account created.",
  "user": {
    "id": 12,
    "name": "Testing Corp Admin",
    "email": "orgadmin@testingcorp.com",
    "organisation_id": 4,
    "role_id": 2
  }
}
```

---

## Phase 2: Organization Admin Testing

### 2.1 Switch to Org Admin Account

#### Test 6: Org Admin Login
**Endpoint:** `POST {{base_url}}/auth/login`

**Request Body:**
```json
{
  "email": "orgadmin@testingcorp.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12,
    "name": "Testing Corp Admin",
    "email": "orgadmin@testingcorp.com",
    "role": "Org-admin",
    "organisation_id": 4
  }
}
```

### 2.2 Team Member Management

#### Test 7: Invite Manager
**Endpoint:** `POST {{base_url}}/users/invite`

**Request Body:**
```json
{
  "email": "manager@testingcorp.com",
  "organisation_id": 4,
  "role_id": 3
}
```

#### Test 8: Accept Manager Invitation
**Endpoint:** `POST {{base_url}}/users/accept-invitation`

**Request Body:**
```json
{
  "token": "{{invitation_token}}",
  "name": "Testing Corp Manager",
  "phone": "+919876543297",
  "password": "manager123"
}
```

#### Test 9: Get Organization Users
**Endpoint:** `GET {{base_url}}/users/organisation/4`

**Expected Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 12,
      "name": "Testing Corp Admin",
      "email": "orgadmin@testingcorp.com",
      "role": "Org-admin"
    },
    {
      "id": 13,
      "name": "Testing Corp Manager",
      "email": "manager@testingcorp.com",
      "role": "Manager"
    }
  ]
}
```

---

## Phase 3: Lead Management Testing

### 3.1 Lead Capture Testing

#### Test 10: Capture Website Lead
**Endpoint:** `POST {{base_url}}/leads/capture-website-lead`

**Request Body:**
```json
{
  "email": "prospect@example.com",
  "phone": "+919876543296",
  "first_name": "John",
  "last_name": "Prospect",
  "full_name": "John Prospect",
  "page_url": "https://testingcorp.com/contact",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "testing_campaign",
  "custom_fields": {
    "company": "Prospect Corp",
    "budget": "$50,000",
    "timeline": "3 months",
    "interest": "Lead Management Software"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "lead_id": 11,
  "lead_meta_id": 11,
  "assigned_to": {
    "user_id": 13,
    "name": "Testing Corp Manager",
    "email": "manager@testingcorp.com"
  }
}
```

#### Test 11: Capture Landing Page Lead
**Endpoint:** `POST {{base_url}}/leads/capture-landing-page-lead`

**Request Body:**
```json
{
  "email": "prospect2@example.com",
  "phone": "+919876543295",
  "first_name": "Jane",
  "last_name": "Prospect",
  "page_url": "https://testingcorp.com/landing",
  "utm_source": "facebook",
  "utm_campaign": "lead_gen_campaign",
  "custom_fields": {
    "company": "Prospect Solutions",
    "budget": "$25,000",
    "timeline": "6 months"
  }
}
```

---

## Phase 4: Manager Role Testing

### 4.1 Switch to Manager Account

#### Test 12: Manager Login
**Endpoint:** `POST {{base_url}}/auth/login`

**Request Body:**
```json
{
  "email": "manager@testingcorp.com",
  "password": "manager123"
}
```

### 4.2 Lead Assignment Management

#### Test 13: Get User Assignments
**Endpoint:** `GET {{base_url}}/assignments/user/13?status=active&limit=50&offset=0`

**Expected Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": 13,
      "lead_id": 11,
      "lead_name": "John Prospect",
      "lead_email": "prospect@example.com",
      "assigned_at": "2025-01-15T10:45:00Z",
      "status": "active"
    }
  ],
  "total_count": 1
}
```

#### Test 14: Manual Lead Assignment
**Endpoint:** `POST {{base_url}}/assignments/manual-assign`

**Request Body:**
```json
{
  "lead_id": 12,
  "assigned_to": 13,
  "notes": "High priority lead - follow up within 24 hours"
}
```

#### Test 15: Get Assignment History
**Endpoint:** `GET {{base_url}}/assignments/history/11`

**Expected Response:**
```json
{
  "success": true,
  "lead_id": 11,
  "assignment_history": [
    {
      "id": 13,
      "assigned_user_id": 13,
      "assigned_user_name": "Testing Corp Manager",
      "assigned_at": "2025-01-15T10:45:00Z",
      "assigned_by_user_id": 12,
      "assigned_by_name": "Testing Corp Admin",
      "notes": "Auto-assigned new lead"
    }
  ]
}
```

---

## Phase 5: Lead Activity Management

### 5.1 Lead Activity Tracking

#### Test 16: Add Lead Activity (Call)
**Endpoint:** `POST {{base_url}}/leads/11/activities`

**Request Body:**
```json
{
  "activity_type": "call",
  "subject": "Initial qualification call",
  "description": "Called to understand business needs and budget requirements",
  "activity_date": "2025-01-15T14:00:00Z",
  "status": "completed",
  "priority": "high",
  "outcome": "Qualified lead - budget confirmed $50K+",
  "next_action": "Schedule product demo"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Activity added successfully",
  "activity": {
    "id": 13,
    "lead_id": 11,
    "activity_type": "call",
    "subject": "Initial qualification call",
    "status": "completed",
    "created_at": "2025-01-15T14:00:00Z"
  }
}
```

#### Test 17: Add Lead Activity (Meeting)
**Endpoint:** `POST {{base_url}}/leads/11/activities`

**Request Body:**
```json
{
  "activity_type": "meeting",
  "subject": "Product demonstration",
  "description": "Comprehensive product demo focusing on lead management features",
  "activity_date": "2025-01-16T10:00:00Z",
  "due_date": "2025-01-16T11:00:00Z",
  "status": "pending",
  "priority": "high"
}
```

#### Test 18: Update Lead Status
**Endpoint:** `PUT {{base_url}}/leads/11/status`

**Request Body:**
```json
{
  "status": "meeting_scheduled",
  "notes": "Demo scheduled for tomorrow",
  "next_action_required": "Prepare demo materials"
}
```

---

## Phase 6: Analytics & Reporting

### 6.1 Assignment Analytics

#### Test 19: Get Assignment Analytics
**Endpoint:** `GET {{base_url}}/assignments/analytics?date_from=2025-01-01&date_to=2025-01-31`

**Expected Response:**
```json
{
  "success": true,
  "organisation_id": 4,
  "date_range": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "analytics": {
    "basic_stats": {
      "total_assignments": 2,
      "active_assignments": 2,
      "completed_assignments": 0,
      "cancelled_assignments": 0,
      "avg_completion_hours": 0,
      "active_team_members": 1
    },
    "team_performance": [
      {
        "user_id": 13,
        "user_name": "Testing Corp Manager",
        "user_email": "manager@testingcorp.com",
        "total_assignments": 2,
        "completed_assignments": 0,
        "active_assignments": 2,
        "avg_completion_hours": 0,
        "completion_rate_percent": 0
      }
    ]
  }
}
```

#### Test 20: Get Workload Balance Report
**Endpoint:** `GET {{base_url}}/assignments/analytics/workload-balance`

#### Test 21: Generate Performance Report
**Endpoint:** `GET {{base_url}}/assignments/analytics/performance-report?user_id=13&date_from=2025-01-01&date_to=2025-01-31`

---

## Phase 7: Advanced Lead Management

### 7.1 Bulk Operations

#### Test 22: Auto Assign Multiple Leads
**Endpoint:** `POST {{base_url}}/assignments/auto-assign`

**Request Body:**
```json
{
  "lead_ids": [11, 12]
}
```

#### Test 23: Bulk Reassign Leads
**Endpoint:** `POST {{base_url}}/assignments/bulk-reassign`

**Request Body:**
```json
{
  "assignments": [
    {
      "lead_id": 11,
      "new_assigned_to": 12,
      "reason": "Workload balancing"
    }
  ]
}
```

### 7.2 Team Management

#### Test 24: Get Team Members
**Endpoint:** `GET {{base_url}}/assignments/team-members`

#### Test 25: Get Load Balance
**Endpoint:** `GET {{base_url}}/assignments/load-balance`

---

## Phase 8: User Profile & Settings

### 8.1 Profile Management

#### Test 26: Get User Profile
**Endpoint:** `GET {{base_url}}/users/profile`

#### Test 27: Update User Profile
**Endpoint:** `PUT {{base_url}}/users/profile`

**Request Body:**
```json
{
  "name": "Updated Manager Name",
  "phone": "+919876543290"
}
```

---

## Phase 9: Error Handling & Edge Cases

### 9.1 Authentication Errors

#### Test 28: Invalid Login Credentials
**Endpoint:** `POST {{base_url}}/auth/login`

**Request Body:**
```json
{
  "email": "invalid@example.com",
  "password": "wrongpassword"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Test 29: Unauthorized Access
**Endpoint:** `GET {{base_url}}/users`

**Headers:** (Remove Authorization header)

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 9.2 Permission Testing

#### Test 30: Manager Accessing Super Admin Endpoints
**Endpoint:** `POST {{base_url}}/organisations`

**Headers:**
```
Authorization: Bearer {{manager_token}}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

---

## Phase 10: Data Validation

### 10.1 Input Validation

#### Test 31: Invalid Email Format
**Endpoint:** `POST {{base_url}}/auth/register`

**Request Body:**
```json
{
  "name": "Test User",
  "email": "invalid-email",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

#### Test 32: Missing Required Fields
**Endpoint:** `POST {{base_url}}/leads/capture-website-lead`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Missing required fields",
  "errors": [
    "first_name is required",
    "last_name is required"
  ]
}
```

---

## Testing Checklist

### ✅ Authentication & Authorization
- [ ] Super admin login
- [ ] Org admin login
- [ ] Manager login
- [ ] Invalid credentials handling
- [ ] Token expiration handling
- [ ] Permission-based access control

### ✅ Organization Management
- [ ] Create organization
- [ ] Get organizations list
- [ ] Update organization details

### ✅ User Management
- [ ] Send user invitations
- [ ] Accept invitations
- [ ] User role assignment
- [ ] Get organization users
- [ ] Update user profiles

### ✅ Lead Management
- [ ] Website lead capture
- [ ] Landing page lead capture
- [ ] Facebook webhook integration
- [ ] Lead status updates
- [ ] Lead activity tracking

### ✅ Assignment Management
- [ ] Auto lead assignment
- [ ] Manual lead assignment
- [ ] Bulk reassignment
- [ ] Assignment history
- [ ] Team workload balance

### ✅ Analytics & Reporting
- [ ] Assignment analytics
- [ ] Performance reports
- [ ] Workload balance reports
- [ ] Team statistics

### ✅ Error Handling
- [ ] Invalid input validation
- [ ] Authentication errors
- [ ] Permission errors
- [ ] Missing data handling

---

## Success Criteria

### For Each Test:
1. **Status Code Verification**: Correct HTTP status codes (200, 201, 400, 401, 403, etc.)
2. **Response Structure**: JSON response matches expected format
3. **Data Integrity**: Created/updated data is correctly stored in database
4. **Business Logic**: Workflows follow expected business rules
5. **Security**: Proper authentication and authorization enforcement

### Overall System:
1. **Complete Workflow**: End-to-end lead management process works
2. **Role-Based Access**: Different user roles have appropriate permissions
3. **Data Consistency**: All related data remains consistent across operations
4. **Performance**: API responses within acceptable time limits
5. **Error Handling**: Graceful handling of edge cases and errors

---

## Troubleshooting

### Common Issues:

1. **Token Expiration**
   - Re-login to get fresh token
   - Check token format in Authorization header

2. **Permission Denied**
   - Verify user role and permissions
   - Check organization assignment

3. **Database Connection**
   - Verify database is running
   - Check connection configuration

4. **Missing Environment Variables**
   - Ensure all Postman variables are set
   - Check base_url configuration

---

## Notes

- Always test in the order provided to maintain data dependencies
- Save important IDs (user_id, organisation_id, lead_id) for subsequent tests
- Monitor server logs for detailed error information
- Use different email addresses for each user creation test
- Clean up test data after completion if needed

This manual provides comprehensive coverage of the LeadMagnate API functionality and ensures thorough testing of all system components.