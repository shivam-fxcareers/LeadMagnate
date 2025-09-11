# LeadMagnate Postman Collection Guide

This guide helps you set up and use the LeadMagnate Postman collection for API testing and development.

## 📁 Files Included

- `LeadMagnate_Postman_Collection.json` - Complete API collection with all endpoints
- `LeadMagnate_Environment.json` - Environment variables for easy testing
- `POSTMAN_COLLECTION_README.md` - This guide

## 🚀 Quick Setup

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `LeadMagnate_Postman_Collection.json`
4. Collection will appear in your workspace

### 2. Import Environment
1. Click **Import** button again
2. Select `LeadMagnate_Environment.json`
3. Select the environment from the dropdown (top-right)

### 3. Start Testing
1. Ensure your LeadMagnate server is running on `http://localhost:3001`
2. Start with **Authentication > Login** to get your auth token
3. The token will be automatically saved for subsequent requests

## 📋 Collection Structure

### 🔐 Authentication
- **Register User** - Create new user account
- **Login** - Authenticate and get JWT token (auto-saves token)
- **Verify Email** - Verify user email with OTP

### 📋 Lead Management
- **Capture Website Lead** - Submit lead from website form
- **Capture Landing Page Lead** - Submit lead from landing page
- **Facebook Webhook** - Receive Facebook Lead Ads
- **Bulk Import Leads** - Upload CSV file with multiple leads

### 🎯 Lead Assignment
- **Auto Assign Lead** - Automatic round-robin assignment
- **Manual Assign Lead** - Assign lead to specific user
- **Get Assignment History** - View lead assignment history
- **Get User Assignments** - View assignments for specific user
- **Get Assignment Statistics** - Organization assignment stats
- **Bulk Reassign Leads** - Reassign multiple leads
- **Get Team Members** - List available team members
- **Get Load Balance** - Current workload distribution

### 📊 Analytics & Reporting
- **Get Assignment Analytics** - Comprehensive analytics dashboard
- **Get Workload Balance Report** - Detailed workload analysis
- **Generate Performance Report** - Performance metrics report

### 🏢 Organization Management
- **Get Organizations** - List organizations (admin only)
- **Create Organization** - Create new organization (superadmin only)

### 👥 Role Management
- **Get Roles** - List available user roles

## 🔧 Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3001/api` |
| `auth_token` | JWT authentication token | (auto-populated) |
| `user_id` | Current user ID | (auto-populated) |
| `organisation_id` | Organization ID | `1` |
| `test_email` | Test user email | `test@example.com` |
| `test_password` | Test user password | `testPassword123` |
| `test_lead_id` | Sample lead ID for testing | `456` |
| `test_assignment_id` | Sample assignment ID | `1001` |
| `date_from` | Start date for analytics | `2025-01-01` |
| `date_to` | End date for analytics | `2025-01-31` |

## 🎯 Testing Workflow

### Basic Testing Flow
1. **Register** a new user or use existing credentials
2. **Login** to get authentication token
3. **Capture leads** using website/landing page endpoints
4. **Assign leads** using auto or manual assignment
5. **View analytics** to see performance metrics

### Advanced Testing
1. **Bulk import** leads from CSV file
2. **Reassign leads** for load balancing
3. **Generate reports** for specific date ranges
4. **Monitor workload** distribution among team members

## 🔍 Sample Test Data

### Sample Lead Data
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

### Sample CSV Format for Bulk Import
```csv
email,phone,first_name,last_name,company,source
lead1@example.com,+919876543210,John,Doe,ABC Corp,website
lead2@example.com,+919876543211,Jane,Smith,XYZ Ltd,facebook
lead3@example.com,+919876543212,Bob,Johnson,DEF Inc,google
```

## 🛠️ Troubleshooting

### Common Issues

**401 Unauthorized Error**
- Ensure you're logged in and have a valid auth token
- Check if the token has expired (login again)
- Verify the Authorization header is set correctly

**404 Not Found Error**
- Check if the server is running on `http://localhost:3001`
- Verify the endpoint URL is correct
- Ensure the resource (lead, user, etc.) exists

**500 Internal Server Error**
- Check server logs for detailed error information
- Verify database connection is working
- Ensure all required environment variables are set

**Rate Limiting (429 Error)**
- Wait before making additional requests
- Check rate limiting rules in API documentation

### Pre-request Scripts
The collection includes automatic scripts that:
- Log request URLs for debugging
- Set up common headers
- Handle authentication token management

### Test Scripts
Automatic tests verify:
- Response status codes (200/201)
- Response structure (success field)
- Data validation

## 📚 Additional Resources

- **API Documentation**: `API_DOCUMENTATION.md`
- **Facebook Setup**: `FACEBOOK_LEADS_SETUP.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Webhook Testing**: `WEBHOOK_TESTING_GUIDE.md`

## 🔒 Security Notes

- Never commit real authentication tokens to version control
- Use environment variables for sensitive data
- Rotate API keys regularly
- Test with non-production data when possible

## 📞 Support

For issues with the Postman collection:
1. Check this README for common solutions
2. Review the API documentation
3. Check server logs for detailed error information
4. Ensure all prerequisites are met (database, environment variables)

---

**Happy Testing! 🚀**