# Facebook Lead Ads Integration - Setup & Testing Guide

## Overview
This guide covers the complete setup and testing process for the Facebook Lead Ads webhook integration in the LeadMagnate CRM system.

## System Components

### Database Tables
- **lead_meta**: Stores metadata from Facebook webhooks
- **lead_data**: Stores actual lead information from Facebook Graph API

### API Endpoints
- `GET /api/leads/webhook` - Facebook webhook verification
- `POST /api/leads/webhook` - Facebook webhook handler
- `GET /api/leads/organisation/:organisationId` - Get leads for organization
- `GET /api/leads/:leadId` - Get specific lead
- `PUT /api/leads/:leadId/status` - Update lead status

## Environment Variables Setup

Add these variables to your `.env` file:

```env
# Facebook Integration
FB_PAGE_ID=your_facebook_page_id
FB_ACCESS_TOKEN=your_facebook_page_access_token
FB_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token

# Existing database variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lead_magnate
```

### How to Get Facebook Credentials

1. **Facebook Page ID**:
   - Go to your Facebook Page
   - Click "About" tab
   - Scroll down to find "Page ID"

2. **Facebook Page Access Token**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create/select your app
   - Go to Tools & Support > Graph API Explorer
   - Select your page and generate a page access token
   - **Important**: Make sure to get a long-lived token

3. **Webhook Verify Token**:
   - Create a custom string (e.g., "leadmagnate_webhook_2024")
   - This will be used to verify webhook requests

## Facebook App Configuration

### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Business" type
4. Fill in app details

### 2. Add Lead Ads Product
1. In your app dashboard, click "Add Product"
2. Find "Lead Ads" and click "Set Up"
3. Follow the setup instructions

### 3. Configure Webhooks
1. In Lead Ads settings, go to "Webhooks"
2. Click "Subscribe to this object"
3. Add your webhook URL: `https://yourdomain.com/api/leads/webhook`
4. Enter your verify token (from .env file)
5. Subscribe to `leadgen` events

## Testing the Integration

### 1. Start the Server
```bash
npm run dev
# or
node index.js
```

### 2. Test Webhook Verification

**Manual Test**:
```bash
curl "http://localhost:3000/api/leads/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test_challenge"
```

**Expected Response**: `test_challenge`

### 3. Test Webhook Handler

**Sample Facebook Webhook Payload**:
```bash
curl -X POST http://localhost:3000/api/leads/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [
      {
        "id": "your_page_id",
        "time": 1234567890,
        "changes": [
          {
            "field": "leadgen",
            "value": {
              "leadgen_id": "123456789",
              "page_id": "your_page_id",
              "form_id": "form_123",
              "adgroup_id": "ad_123",
              "campaign_id": "campaign_123",
              "created_time": 1234567890
            }
          }
        ]
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### 4. Test Lead Retrieval

**Get Leads for Organization**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/leads/organisation/1?page=1&limit=10"
```

**Get Specific Lead**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/leads/1"
```

**Update Lead Status**:
```bash
curl -X PUT http://localhost:3000/api/leads/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified",
    "assigned_user_id": 1
  }'
```

## Database Verification

After receiving a webhook, check the database:

```sql
-- Check lead_meta table
SELECT * FROM lead_meta ORDER BY received_at DESC LIMIT 5;

-- Check lead_data table
SELECT * FROM lead_data ORDER BY created_at DESC LIMIT 5;

-- Check lead with meta information
SELECT 
    ld.*,
    lm.platform_key,
    lm.source_lead_id,
    lm.processing_status
FROM lead_data ld
JOIN lead_meta lm ON ld.lead_meta_id = lm.id
ORDER BY ld.created_at DESC
LIMIT 5;
```

## Troubleshooting

### Common Issues

1. **"FB_ACCESS_TOKEN not configured" Error**
   - Ensure FB_ACCESS_TOKEN is set in .env file
   - Verify the token is valid and not expired
   - Check token permissions include lead_ads_read

2. **"Invalid OAuth access token" from Facebook**
   - Token might be expired
   - Generate a new long-lived token
   - Ensure token has proper permissions

3. **Webhook Verification Failed**
   - Check FB_WEBHOOK_VERIFY_TOKEN matches Facebook app settings
   - Ensure webhook URL is accessible from internet
   - Verify SSL certificate if using HTTPS

4. **No Leads Being Created**
   - Check server logs for errors
   - Verify FB_PAGE_ID matches the page sending leads
   - Ensure database tables exist and are accessible

5. **Permission Denied on Lead Routes**
   - User needs proper role and permissions
   - Add 'leads' module to the system
   - Assign lead permissions to user roles

### Debug Steps

1. **Check Server Logs**:
   ```bash
   # Look for these log messages:
   # "Created lead meta record with ID: X"
   # "Created lead data record with ID: X"
   # "Updated lead meta X status to processed"
   ```

2. **Test Facebook Graph API Manually**:
   ```bash
   curl "https://graph.facebook.com/v17.0/LEADGEN_ID?access_token=YOUR_TOKEN"
   ```

3. **Verify Database Connection**:
   ```bash
   # Check if tables exist
   mysql -u root -p lead_magnate -e "SHOW TABLES LIKE 'lead_%';"
   ```

## Production Deployment

### 1. SSL Certificate
- Facebook requires HTTPS for webhook URLs
- Use Let's Encrypt or your hosting provider's SSL

### 2. Webhook URL
- Update Facebook app with production URL
- Format: `https://yourdomain.com/api/leads/webhook`

### 3. Environment Variables
- Set all FB_* variables in production environment
- Use long-lived access tokens
- Keep verify token secure

### 4. Monitoring
- Monitor webhook endpoint for errors
- Set up alerts for failed lead processing
- Log all Facebook API responses

## Security Considerations

1. **Webhook Verification**
   - Always verify webhook signatures in production
   - Use Facebook's signature verification

2. **Access Token Security**
   - Store tokens securely
   - Rotate tokens regularly
   - Monitor token usage

3. **Rate Limiting**
   - Implement rate limiting on webhook endpoint
   - Handle Facebook API rate limits

4. **Data Privacy**
   - Comply with GDPR/privacy regulations
   - Implement data retention policies
   - Secure lead data storage

## Sample Facebook Graph API Response

```json
{
  "created_time": "2024-01-15T10:30:00+0000",
  "id": "123456789",
  "field_data": [
    {
      "name": "email",
      "values": ["john.doe@example.com"]
    },
    {
      "name": "full_name",
      "values": ["John Doe"]
    },
    {
      "name": "phone_number",
      "values": ["+1234567890"]
    }
  ],
  "page_name": "Your Business Page"
}
```

## Next Steps

1. **Add Leads Module to System**
   - Create 'leads' module in modules table
   - Assign permissions to roles

2. **Implement Additional Features**
   - Lead assignment workflow
   - Email notifications for new leads
   - Lead scoring system
   - Integration with other platforms

3. **Analytics & Reporting**
   - Lead conversion tracking
   - Source performance analysis
   - ROI calculations

## Support

For issues with this integration:
1. Check server logs first
2. Verify Facebook app configuration
3. Test with sample payloads
4. Review database records
5. Check environment variables

---

**Note**: This integration handles Facebook Lead Ads specifically. For other lead sources (Instagram, website forms), additional endpoints and logic will need to be implemented.