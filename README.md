# AgenStack.ai - Multi-Tenant SaaS Chatbot Platform

A production-ready, multi-tenant chatbot platform that enables businesses to deploy AI-powered customer service chatbots with integrated e-commerce, CRM, and multi-channel support.

## 🚀 Features

### Core Functionality
- **AI-Powered Chatbot**: OpenAI-powered intelligent conversations
- **Multi-Tenant Architecture**: Secure organization-level data isolation
- **Role-Based Access Control (RBAC)**: User, Manager, Admin, and Developer roles
- **Real-Time Conversations**: Live chat management and agent handoff
- **Analytics Dashboard**: Comprehensive metrics and reporting

### Bot Configuration
- **Bot Builder**: Customize AI personality, directives, and behavior
- **Knowledge Base**: Upload documents, scrape websites, manage Q&As
- **Scenario Builder**: Create conversation flows and branching logic
- **Proactive Engagement**: Trigger messages based on user behavior
- **Custom Forms**: Capture leads and customer information

### Integrations (OAuth-Based)
- **Shopify**: Product search, order tracking, cart management
- **Kustomer**: CRM and ticket management
- **Klaviyo**: Email marketing and subscriber management
- **Facebook Messenger**: Multi-channel messaging
- **Custom Webhooks**: Extensible integration framework

### E-Commerce Support
- Product recommendations
- Cart recovery prompts
- Order tracking and status updates
- Draft order creation
- Inventory management

### Multi-Channel
- Web chat widget
- Facebook Messenger
- Instagram DM
- WhatsApp (via Twilio)
- SMS messaging
- Email fallback

## 🏗️ Architecture

```
Frontend: React + Vite + TailwindCSS
Backend: Vercel Serverless Functions
Database: Neon PostgreSQL
Authentication: Custom JWT-based auth
Integrations: OAuth 2.0 flows
```

### Multi-Tenant Design
- Each organization has isolated data with `organization_id`
- OAuth tokens stored per-organization in encrypted format
- User roles scoped to organizations
- RBAC enforces feature access based on user permissions

## 📋 Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL account
- OpenAI API key
- Vercel account (for deployment)
- Integration accounts (Shopify, Kustomer, etc.) as needed

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd chatbot-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=your_neon_database_url
NEON_DATABASE_URL=your_neon_database_url

# OpenAI
VITE_OPENAI_API_KEY=sk-proj-your_key
VITE_OPENAI_ORG_ID=org-your_org_id

# Integration OAuth (optional - users connect via UI)
# VITE_SHOPIFY_API_KEY=your_key
# VITE_SHOPIFY_API_SECRET=your_secret
```

### 4. Database Setup
Run the SQL migrations in `/sql` directory to create tables:
- users
- organizations
- bot_configs
- oauth_credentials
- conversations
- messages
- etc.

### 5. Local Development
```bash
npm run dev
```
Visit `http://localhost:5173`

### 6. Production Deployment
```bash
vercel --prod
```

## 👥 User Roles & Permissions

| Role | Access Level |
|------|-------------|
| **User** | View dashboard, conversations, widget |
| **Manager** | + Bot Builder, Scenarios, Forms, Analytics |
| **Admin** | + All integrations, CRM, E-Commerce, Multi-channel |
| **Developer** | + Webhooks, API keys, Security settings, User management |
| **Super Admin** | Platform-wide access across all organizations |

## 🔐 Security Features

- GDPR/CCPA compliance tools
- IP filtering and access controls
- User consent management
- SSO/2FA for agents
- Role-based access control (RBAC)
- Encrypted credentials storage
- Secure OAuth flows

## 📱 Integration Setup (User Flow)

Users connect their own integrations via the Integrations page:

1. Navigate to Integrations
2. Select a provider (Shopify, Kustomer, etc.)
3. Click "Connect"
4. OAuth redirect to provider
5. Authorize access
6. Credentials stored securely per-organization

No manual API key entry required for OAuth-enabled integrations.

## 🧪 Testing

### Test User Creation
```bash
# Create test organization and user
npm run create-test-user
```

### Test Integrations
Navigate to Admin Panel → Integrations to test:
- Shopify product search
- Order tracking
- Kustomer ticket creation
- Klaviyo subscriber management

## 📊 Analytics & Reporting

The platform tracks:
- Conversation volume and trends
- CSAT/NPS scores
- Agent performance metrics
- Resolution times
- Conversion funnels
- Product views and cart events
- Channel performance

## 🎨 Customization

### Widget Customization
- Colors and branding
- Position and size
- Avatar and logos
- Greeting messages
- Custom CSS/JS injection

### Bot Personality
- Tone and style
- Response templates
- Fallback messages
- Escalation triggers

## 📚 Documentation

- `/docs/INTEGRATION_ARCHITECTURE.md` - Multi-tenant integration design
- `/docs/API_SPECIFICATION.md` - API endpoints and flows
- `/docs/RBAC_IMPLEMENTATION_GUIDE.md` - Role-based access control
- `/docs/SECURITY_IMPLEMENTATION.md` - Security features

## 🚨 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection limits
- Ensure IP whitelist includes your deployment

### OAuth Redirect Issues
- Verify redirect URIs match in provider settings
- Check CORS configuration
- Ensure state parameter is passed correctly

### Missing Features in UI
- Check user role and permissions
- Verify RBAC configuration
- Check browser console for errors

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Submit pull request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For support, email support@agenstack.ai or open an issue in the repository.

## 🎯 Roadmap

- [ ] Advanced analytics with custom dashboards
- [ ] AI training on custom datasets
- [ ] Multi-language support
- [ ] Voice integration
- [ ] Mobile SDKs (iOS/Android)
- [ ] Advanced workflow automation
- [ ] A/B testing for bot responses
- [ ] Integration marketplace

---

Built with ❤️ using React, Vite, TailwindCSS, and Vercel
