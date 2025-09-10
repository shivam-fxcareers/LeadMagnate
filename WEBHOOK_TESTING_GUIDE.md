# Facebook Lead Ads Webhook Testing Guide

## Overview
This guide provides step-by-step instructions to test your Facebook Lead Ads webhook integration to ensure it correctly processes real Facebook data.

## Prerequisites

1. **Server Running**: Ensure your server is running (currently on port 3001)
2. **Database Setup**: Verify `lead_meta` and `lead_data` tables exist
3. **Environment Variables**: Set FB_PAGE_ID, FB_ACCESS_TOKEN, FB_WEBHOOK_VERIFY_TOKEN

## Testing Methods

### Method 1: Manual Testing with Sample Facebook Data

#### Step 1: Test Webhook Verification
```bash
# Test webhook verification endpoint
curl "http://localhost:3001/api/leads/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test_challenge_123"

# Expected Response: test_challenge_123
```

#### Step 2: Test Webhook with Real Facebook Payload Structure
```bash
# Test with realistic Facebook webhook payload
curl -X POST http://localhost:3001/api/leads/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [
      {
        "id": "YOUR_FB_PAGE_ID",
        "time": 1640995200,
        "changes": [
          {
            "field": "leadgen",
            "value": {
              "leadgen_id": "1234567890123456",
              "page_id": "YOUR_FB_PAGE_ID",
              "form_id": "987654321098765",
              "adgroup_id": "23851234567890123",
              "campaign_id": "23851234567890124",
              "ad_id": "23851234567890125",
              "created_time": 1640995200
            }
          }
        ]
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### Method 2: Using Facebook Graph API Explorer

#### Step 1: Get Real Lead Data
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app and get a page access token
3. Query a real lead: `GET /{leadgen_id}?fields=id,created_time,field_data`

#### Step 2: Test with Real Lead ID
```bash
# Replace REAL_LEADGEN_ID with actual Facebook lead ID
curl -X POST http://localhost:3001/api/leads/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [
      {
        "id": "YOUR_FB_PAGE_ID",
        "time": 1640995200,
        "changes": [
          {
            "field": "leadgen",
            "value": {
              "leadgen_id": "REAL_LEADGEN_ID",
              "page_id": "YOUR_FB_PAGE_ID",
              "form_id": "987654321098765",
              "created_time": 1640995200
            }
          }
        ]
      }
    ]
  }'
```

### Method 3: Using ngrok for Live Testing

#### Step 1: Install and Setup ngrok
```bash
# Install ngrok (if not already installed)
# Download from https://ngrok.com/

# Expose your local server
ngrok http 3001
```

#### Step 2: Configure Facebook Webhook
1. Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
2. In Facebook App settings, set webhook URL to: `https://abc123.ngrok.io/api/leads/webhook`
3. Subscribe to `leadgen` events

#### Step 3: Generate Real Test Lead
1. Create a Facebook Lead Ad (or use existing)
2. Submit a test lead through the actual ad
3. Monitor your server logs for incoming webhook

## Verification Steps

### 1. Check Server Logs
Monitor your server console for these messages:
```
Received Facebook webhook for page: YOUR_PAGE_ID
Created lead meta record with ID: X
Fetching lead details for leadgen_id: XXXXXXX
Created lead data record with ID: Y
Updated lead meta X status to processed
```

### 2. Verify Database Records

#### Check lead_meta table:
```sql
SELECT * FROM lead_meta ORDER BY received_at DESC LIMIT 5;
```

**Expected fields:**
- `source_lead_id`: Facebook leadgen_id
- `platform_key`: 'facebook'
- `organisation_id`: Should match your org
- `raw_webhook_data`: JSON with Facebook payload
- `processing_status`: Should be 'processed'

#### Check lead_data table:
```sql
SELECT * FROM lead_data ORDER BY created_at DESC LIMIT 5;
```

**Expected fields:**
- `lead_meta_id`: Links to lead_meta record
- `name`: Extracted from Facebook field_data
- `email`: Extracted from Facebook field_data
- `phone`: Extracted from Facebook field_data (if provided)
- `raw_field_data`: JSON with all Facebook fields

#### Join query to see complete data:
```sql
SELECT 
    ld.name,
    ld.email,
    ld.phone,
    lm.source_lead_id,
    lm.processing_status,
    lm.received_at,
    ld.created_at
FROM lead_data ld
JOIN lead_meta lm ON ld.lead_meta_id = lm.id
ORDER BY ld.created_at DESC
LIMIT 5;
```

### 3. Test API Endpoints

#### Get leads for organization:
```bash
# First, get a JWT token by logging in
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'

# Use the token to get leads
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/api/leads/organisation/1?page=1&limit=10"
```

#### Get specific lead:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/api/leads/1"
```

#### Update lead status:
```bash
curl -X PUT http://localhost:3001/api/leads/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified",
    "assigned_user_id": 1
  }'
```

## Common Test Scenarios

### Scenario 1: Valid Lead with All Fields
```json
{
  "object": "page",
  "entry": [{
    "id": "YOUR_FB_PAGE_ID",
    "time": 1640995200,
    "changes": [{
      "field": "leadgen",
      "value": {
        "leadgen_id": "1234567890123456",
        "page_id": "YOUR_FB_PAGE_ID",
        "form_id": "987654321098765",
        "created_time": 1640995200
      }
    }]
  }]
}
```

### Scenario 2: Invalid Page ID (Should be rejected)
```json
{
  "object": "page",
  "entry": [{
    "id": "WRONG_PAGE_ID",
    "time": 1640995200,
    "changes": [{
      "field": "leadgen",
      "value": {
        "leadgen_id": "1234567890123456",
        "page_id": "WRONG_PAGE_ID"
      }
    }]
  }]
}
```

### Scenario 3: Multiple Leads in One Webhook
```json
{
  "object": "page",
  "entry": [{
    "id": "YOUR_FB_PAGE_ID",
    "time": 1640995200,
    "changes": [
      {
        "field": "leadgen",
        "value": {
          "leadgen_id": "1234567890123456",
          "page_id": "YOUR_FB_PAGE_ID"
        }
      },
      {
        "field": "leadgen",
        "value": {
          "leadgen_id": "1234567890123457",
          "page_id": "YOUR_FB_PAGE_ID"
        }
      }
    ]
  }]
}
```

## Error Testing

### Test Invalid Access Token
1. Set wrong FB_ACCESS_TOKEN in .env
2. Send webhook payload
3. Check logs for "Invalid OAuth access token" error
4. Verify lead_meta status is 'failed'

### Test Network Issues
1. Disconnect internet temporarily
2. Send webhook payload
3. Verify graceful error handling

### Test Database Issues
1. Stop MySQL service temporarily
2. Send webhook payload
3. Check error handling and logging

## Performance Testing

### Load Testing
```bash
# Send multiple webhooks simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/leads/webhook \
    -H "Content-Type: application/json" \
    -d '{"object":"page","entry":[{"id":"YOUR_FB_PAGE_ID","changes":[{"field":"leadgen","value":{"leadgen_id":"'$i'234567890123456","page_id":"YOUR_FB_PAGE_ID"}}]}]}' &
done
wait
```

## Monitoring and Alerts

### Key Metrics to Monitor
1. **Webhook Response Time**: Should be < 20 seconds (Facebook timeout)
2. **Success Rate**: Percentage of successfully processed leads
3. **Error Rate**: Failed webhook processing attempts
4. **Database Performance**: Query execution times

### Log Analysis
```bash
# Monitor real-time logs
tail -f server.log | grep "Facebook webhook"

# Count successful vs failed processing
grep "Created lead data record" server.log | wc -l
grep "Error processing leadgen" server.log | wc -l
```

## Troubleshooting Common Issues

### Issue 1: "Page ID mismatch"
- **Cause**: FB_PAGE_ID doesn't match webhook page_id
- **Solution**: Verify FB_PAGE_ID in .env file

### Issue 2: "Invalid OAuth access token"
- **Cause**: Expired or invalid FB_ACCESS_TOKEN
- **Solution**: Generate new long-lived page access token

### Issue 3: "Lead not found in Facebook API"
- **Cause**: Lead might be deleted or access token lacks permissions
- **Solution**: Check token permissions and lead existence

### Issue 4: Database connection errors
- **Cause**: MySQL service down or wrong credentials
- **Solution**: Check database service and connection settings

## Production Checklist

- [ ] SSL certificate configured (Facebook requires HTTPS)
- [ ] Webhook URL accessible from internet
- [ ] Environment variables properly set
- [ ] Database tables created and indexed
- [ ] Error logging and monitoring setup
- [ ] Rate limiting configured
- [ ] Backup and recovery procedures in place
- [ ] Load testing completed
- [ ] Security audit performed

## Sample Facebook Graph API Response

When your webhook fetches lead details, expect this structure:
```json
{
  "created_time": "2024-01-15T10:30:00+0000",
  "id": "1234567890123456",
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
    },
    {
      "name": "company_name",
      "values": ["Acme Corp"]
    }
  ]
}
```

## Next Steps

1. **Start with Method 1** (manual testing) to verify basic functionality
2. **Use Method 2** (Graph API Explorer) to test with real Facebook data
3. **Implement Method 3** (ngrok) for end-to-end testing
4. **Set up monitoring** for production deployment
5. **Create automated tests** for continuous integration

---

**Remember**: Always test with real Facebook lead IDs when possible, as this ensures your integration handles actual Facebook API responses correctly.