# 🚀 ChatBot Platform - Production Deployment Guide

## Quick Start

### 1. Database Setup (Neon PostgreSQL)

1. Create a Neon account at https://neon.tech
2. Create a new project
3. Run the following SQL scripts in order:

```bash
# Core schema
sql/database_complete_schema.sql

# Proactive triggers
sql/add_proactive_triggers.sql
```

4. Copy your connection string from Neon dashboard

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Neon Database
DATABASE_URL=postgresql://user:password@host/database

# OpenAI
VITE_OPENAI_API_KEY=sk-proj-your-key-here
VITE_OPENAI_ORG_ID=org-your-org-id (optional)

# Shopify (Optional)
SHOPIFY_CLIENT_ID=your-client-id
SHOPIFY_CLIENT_SECRET=your-client-secret
SHOPIFY_REDIRECT_URI=https://your-domain.vercel.app/shopify/callback
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers

# Kustomer (Optional)
VITE_KUSTOMER_API_KEY=your-kustomer-key

# Klaviyo (Optional)
VITE_KLAVIYO_API_KEY=your-klaviyo-key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Local Development

```bash
npm run dev
```

Visit http://localhost:5173

### 5. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy!

#### Option B: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📊 Features Implemented

### ✅ Analytics Dashboard
- **Sales Metrics**: Conversion rate, AI-generated sales & orders, AOV, PDP redirects, add to cart
- **Engagement Analytics**: Overall engagement rate, proactive engagement rate, conversations by customer type
- **Shoppers Intelligence**: Top products, categories, session times, conversion funnel
- **Missing Info Detection**: Identifies gaps in knowledge base
- **AI Recommendations**: Automated performance insights

### ✅ Proactive Engagement
- **10 Pre-built Templates**:
  - Welcome Discount
  - Exit Intent Offer
  - Cart Abandonment
  - Smart Product Recommendations
  - Free Shipping Alert
  - Low Stock Urgency
  - Assistance Offer
  - VIP Welcome Back
  - Campaign Landing
  - Product Finder Quiz

- **Trigger Types**:
  - Exit intent
  - Scroll percentage
  - Time on page
  - Cart abandonment
  - UTM parameters
  - URL matching

### ✅ Bot Builder
- Live preview
- Personality customization
- Instructions editor
- Greeting messages
- Knowledge base integration

### ✅ CRM & Customer Context
- Contact management
- Conversation history
- Tags and segmentation
- Internal notes
- Agent assignment

### ✅ Integrations
- Shopify OAuth
- Kustomer
- Klaviyo
- Messenger (webhook ready)
- Webhook management
- Zapier-ready endpoints

### ✅ Multi-Channel Support
- Web widget
- Facebook Messenger (webhook)
- Instagram DM (webhook)
- WhatsApp (via Twilio)
- SMS
- Email fallback

### ✅ E-Commerce Features
- Product recommendations
- Cart recovery
- Order tracking
- Return automation
- Catalog connection

### ✅ Security & Compliance
- GDPR tools
- IP filtering
- User consent forms
- Encrypted credentials
- RBAC support

## 🗄️ Database Schema

### Core Tables
- `organizations` - Multi-tenancy support
- `bot_configs` - Bot settings and personality
- `conversations` - Chat sessions
- `messages` - Individual chat messages
- `customers` - Contact database
- `integrations` - Third-party connections
- `knowledge_base` - FAQ and training data
- `analytics_events` - Event tracking

### Proactive Engagement Tables
- `proactive_triggers` - Trigger configurations
- `proactive_trigger_stats` - Performance tracking

## 🔑 API Endpoints

### Database API (`/api/database`)

**GET Endpoints:**
- `GET /api/database` - Health check
- `GET /api/database?endpoint=conversations` - Get conversations
- `GET /api/database?endpoint=messages&conversation_id={id}` - Get messages

**POST Endpoints:**
- `POST /api/database` with `action: create_conversation`
- `POST /api/database` with `action: create_message`
- `POST /api/database` with `action: saveProactiveTrigger`
- `POST /api/database` with `action: getProactiveTriggers`
- `POST /api/database` with `action: toggleProactiveTrigger`
- `POST /api/database` with `action: deleteProactiveTrigger`
- `POST /api/database` with `action: getProactiveTriggerStats`

## 📝 Usage Examples

### Creating a Proactive Trigger

```javascript
import dbService from './services/databaseService';

const trigger = await dbService.saveProactiveTrigger({
  organization_id: 'your-org-id',
  name: 'Exit Intent Offer',
  trigger_type: 'exit_intent',
  message: 'Wait! Get 10% off before you leave!',
  delay_seconds: 0,
  priority: 9,
  conditions: {},
  action_config: {}
});
```

### Tracking Analytics Events

```javascript
await dbService.createAnalyticsEvent({
  organization_id: 'your-org-id',
  conversation_id: 'conversation-id',
  event_type: 'product_viewed',
  event_data: {
    product_id: '12345',
    product_name: 'Product Name',
    price: 29.99
  }
});
```

## 🎨 Customization

### Styling
- Primary styles: `src/index.css`
- TailwindCSS config: `tailwind.config.js`
- Custom animations and glassmorphism effects included

### Adding New Components
1. Create component in `src/components/`
2. Import in `src/App.jsx`
3. Add to navigation array

### Widget Embedding
```html
<!-- Add to your website -->
<script src="https://your-domain.vercel.app/widget.js"></script>
<script>
  ChatWidget.init({
    botId: 'your-bot-id',
    position: 'bottom-right',
    primaryColor: '#3B82F6'
  });
</script>
```

## 🐛 Troubleshooting

### Database Connection Issues
```javascript
// Test connection
import dbService from './services/databaseService';
const result = await dbService.testConnection();
console.log(result);
```

### Offline Mode
The platform includes offline fallback with demo data. Check `databaseService.js` for details.

### CORS Issues
All API endpoints include CORS headers. If issues persist, check `vercel.json` configuration.

## 📦 Deployment Checklist

- [ ] Database schema deployed to Neon
- [ ] Environment variables set in Vercel
- [ ] OPENAI_API_KEY configured
- [ ] Database connection string updated
- [ ] Integration credentials added (optional)
- [ ] Domain configured in Vercel
- [ ] SSL certificate active
- [ ] Test all features in production

## 🔧 Maintenance

### Database Backups
Neon provides automatic backups. Set up additional backups:
```bash
# Export schema
pg_dump $DATABASE_URL > backup.sql
```

### Monitoring
- Check Vercel Analytics for performance
- Monitor API response times
- Review error logs in Vercel dashboard

### Updates
```bash
# Update dependencies
npm update

# Check for security issues
npm audit fix

# Redeploy
vercel --prod
```

## 📞 Support

For issues or questions:
1. Check documentation
2. Review code comments
3. Check Vercel deployment logs
4. Test with demo data (offline mode)

## 🎯 Next Steps

1. Customize bot personality in Bot Builder
2. Add your product catalog to knowledge base
3. Set up proactive triggers using templates
4. Configure integrations (Shopify, Kustomer, etc.)
5. Embed widget on your website
6. Monitor analytics and optimize

---

**Built with:** React, Vite, TailwindCSS, Neon PostgreSQL, OpenAI, Vercel

**Version:** 2.0.0

**Last Updated:** October 2025
