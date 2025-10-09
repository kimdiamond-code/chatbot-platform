# 🎧 Kustomer Integration - Complete Setup Guide

## Overview
The Kustomer integration provides seamless CRM functionality for your chatbot platform, including customer management, ticket creation, conversation sync, and escalation to human agents.

## Features Included ✅

### 🔧 Core Integration Features
- **Real-time Customer Lookup** - Find existing customers by email
- **Automatic Customer Creation** - Create new customer records when needed
- **Conversation Management** - Create and manage support conversations
- **Message Synchronization** - Sync chat messages to Kustomer timeline
- **Ticket Escalation** - Escalate complex issues to human agents
- **Team Assignment** - Route tickets to appropriate support teams
- **Priority Management** - Set and manage ticket priorities
- **Notes & Internal Comments** - Add private notes for team communication

### 📊 Analytics & Insights
- **Customer History** - Access past conversation history
- **Response Time Tracking** - Monitor support team performance
- **Satisfaction Scores** - Track customer satisfaction metrics
- **Agent Performance** - Analyze individual agent metrics

### 🎛️ Configuration Options
- **Automatic Ticket Creation** - Enable/disable ticket creation for escalations
- **Customer Lookup** - Enable/disable automatic customer searches
- **Conversation Sync** - Sync all chat conversations to Kustomer
- **Auto Assignment** - Automatically assign tickets to teams/agents
- **Default Priority Settings** - Set default priority levels
- **Team Routing** - Configure default team assignments

## Setup Instructions

### 1. Kustomer Account Preparation

#### Create API Key:
1. Log into your Kustomer admin panel
2. Navigate to **Settings → API Keys**
3. Click **"Create API Key"**
4. Name it **"ChatBot Integration"**
5. Grant these permissions:
   - `customers:read` - Read customer data
   - `customers:write` - Create/update customers
   - `conversations:read` - Read conversations
   - `conversations:write` - Create/update conversations
   - `messages:write` - Send messages
   - `notes:write` - Add internal notes
   - `teams:read` - List teams for assignment

#### Find Organization Details:
1. Go to **Settings → Organization**
2. Copy your **Organization ID**
3. Note your **Subdomain** (the part before `.kustomerapp.com` in your URL)

### 2. Environment Variables Setup

Add these variables to your `.env` file:

```bash
# Kustomer Integration
KUSTOMER_API_KEY=your_api_key_here
KUSTOMER_ORGANIZATION_ID=your_org_id_here
KUSTOMER_SUBDOMAIN=your_subdomain_here
KUSTOMER_DEFAULT_TEAM_ID=your_team_id_here (optional)
KUSTOMER_ENABLE_SYNC=true
```

### 3. Platform Configuration

1. **Access Integrations Page**:
   - Navigate to **Integrations** in your chatbot platform
   - Find **Kustomer CRM** in the CRM & Support category

2. **Connect Integration**:
   - Click the **Connect** button
   - Enter your API credentials:
     - API Key (starts with 'ey')
     - Organization ID
     - Subdomain
   - Configure integration features
   - Test the connection

3. **Configure Features**:
   - ✅ **Automatic Ticket Creation** - Creates tickets for escalated chats
   - ✅ **Customer Lookup** - Finds existing customers automatically  
   - ✅ **Conversation Sync** - Syncs all chat history to Kustomer
   - ⚙️ **Auto Assignment** - Assigns tickets to default team
   - 🎯 **Default Priority** - Set to Medium/High based on your needs
   - 👥 **Default Team** - Select your primary support team

## How It Works

### Customer Flow:
1. **Chat Initiated** → System checks for existing customer by email
2. **Customer Found** → Loads history and context from Kustomer
3. **New Customer** → Creates new customer record automatically
4. **Conversation Logged** → All messages synced to Kustomer timeline

### Escalation Flow:
1. **Human Request** → Customer asks for human help
2. **Ticket Created** → System creates high-priority ticket in Kustomer
3. **Team Notified** → Assigned team receives notification
4. **Context Included** → Full chat history included in ticket
5. **Handoff Complete** → Customer notified of escalation

### Data Synchronization:
- **Real-time** - Messages sync as they're sent
- **Bidirectional** - Updates flow between platforms
- **Secure** - All data encrypted in transit
- **Reliable** - Built-in retry logic for failed syncs

## Testing the Integration

### 1. Connection Test
```javascript
// Test basic API connectivity
const result = await realKustomerService.testConnection();
console.log(result); // Should return success with user info
```

### 2. Customer Lookup Test
```javascript
// Test customer search
const customer = await realKustomerService.findCustomer('test@example.com');
console.log(customer); // Returns customer data or null
```

### 3. Ticket Creation Test
```javascript
// Test ticket creation
const ticket = await realKustomerService.createConversation(
  customerId, 
  'Test Support Request',
  'chat'
);
console.log(ticket); // Returns new conversation object
```

## Best Practices

### 🎯 Configuration Recommendations:
- **Enable Conversation Sync** for complete customer history
- **Set Default Team** to your primary support group
- **Use Medium Priority** as default to avoid overwhelming urgent queue
- **Enable Auto Assignment** for faster response times

### 🔒 Security Best Practices:
- Store API keys securely in environment variables
- Use least-privilege permissions for API key
- Regularly rotate API keys (quarterly recommended)
- Monitor API usage and rate limits

### 📈 Performance Optimization:
- Enable customer lookup to reduce duplicate records
- Use appropriate priority levels to manage workload
- Set up team routing to distribute tickets efficiently
- Monitor sync performance and adjust batch sizes

## Troubleshooting

### Common Issues:

#### Authentication Errors:
```
Error: 401 Unauthorized
```
**Solution**: Verify API key is correct and has proper permissions

#### Rate Limiting:
```
Error: 429 Too Many Requests
```
**Solution**: Built-in retry logic handles this automatically

#### Invalid Organization ID:
```
Error: 403 Forbidden
```
**Solution**: Ensure Organization ID matches your Kustomer account

#### Team Assignment Failures:
```
Error: Team not found
```
**Solution**: Verify team ID exists and API key has teams:read permission

### Debug Mode:
Enable debug logging by setting:
```bash
KUSTOMER_DEBUG=true
```

## API Rate Limits

Kustomer enforces these rate limits:
- **100 requests per minute** for most endpoints
- **Burst limit**: 10 requests per second
- **Daily limit**: 10,000 requests per day

The integration includes automatic retry logic with exponential backoff to handle rate limiting gracefully.

## Advanced Configuration

### Custom Field Mapping:
Customize how customer data maps between your chat platform and Kustomer:

```javascript
// Configure in your bot settings
const customFieldMapping = {
  'customerEmail': 'attributes.emails[0].email',
  'customerName': 'attributes.name',
  'customerPhone': 'attributes.phones[0].phone',
  'tags': 'attributes.tags'
};
```

### Webhook Integration:
Set up webhooks to receive real-time updates from Kustomer:

```javascript
// Webhook endpoint for Kustomer events
POST /api/webhooks/kustomer
{
  "event": "conversation.updated",
  "data": { /* conversation data */ }
}
```

## Support & Maintenance

### Regular Maintenance Tasks:
- [ ] Monitor API key expiration
- [ ] Review team assignments quarterly  
- [ ] Audit permission settings
- [ ] Check sync performance metrics
- [ ] Update integration when new features are released

### Getting Help:
1. Check this documentation first
2. Review Kustomer API documentation
3. Test connection using built-in tools
4. Contact support with specific error messages

## Success Metrics

Track these KPIs to measure integration success:
- **Customer Resolution Time** - Average time to resolve tickets
- **Escalation Rate** - Percentage of chats escalated to humans
- **Customer Satisfaction** - CSAT scores from Kustomer
- **Agent Productivity** - Tickets handled per agent per day
- **Data Sync Success Rate** - Percentage of successful syncs

---

🎉 **Integration Complete!** Your chatbot now has enterprise-grade CRM capabilities with Kustomer integration.