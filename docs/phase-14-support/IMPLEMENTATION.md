# Phase 14: Customer Support

> **Priority:** 🟠 High | **Estimated Effort:** 1-2 weeks

## Overview

Implement customer support infrastructure to help users succeed and reduce churn. This includes self-service resources and direct support channels.

---

## 14.1 Help Center

### Knowledge Base Structure

```
/help                        → Help center home
/help/getting-started        → Getting started guides
/help/orders                 → Order management articles
/help/customers              → Customer management articles
/help/payments               → Payment & invoicing articles
/help/billing                → Subscription & billing articles
/help/troubleshooting        → Common issues & solutions
```

### Database Schema

```sql
CREATE TABLE help_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Article info
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown
  excerpt TEXT,
  
  -- Categorization
  category TEXT NOT NULL,
  tags TEXT, -- JSON array
  
  -- Search
  search_keywords TEXT,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);

CREATE TABLE help_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_help_articles_category ON help_articles(category);
CREATE INDEX idx_help_articles_published ON help_articles(is_published);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/help/categories` | List categories |
| GET | `/api/help/articles` | List/search articles |
| GET | `/api/help/articles/:slug` | Get article content |
| POST | `/api/help/articles/:id/feedback` | Submit helpful/not helpful |

### Search Implementation

```typescript
app.get('/api/help/search', async (c) => {
  const query = c.req.query('q');
  
  // Full-text search on title, content, keywords
  const articles = await db
    .select()
    .from(helpArticles)
    .where(
      and(
        eq(helpArticles.isPublished, 1),
        or(
          like(helpArticles.title, `%${query}%`),
          like(helpArticles.content, `%${query}%`),
          like(helpArticles.searchKeywords, `%${query}%`)
        )
      )
    )
    .limit(10);
  
  return c.json({ success: true, data: articles });
});
```

---

## 14.2 In-App Help Widget

### Contextual Help

Show relevant help based on current page:

```typescript
const helpMapping: Record<string, string[]> = {
  '/orders': ['creating-orders', 'order-statuses', 'bulk-updates'],
  '/orders/new': ['creating-orders', 'pricing-calculator'],
  '/customers': ['adding-customers', 'customer-balances'],
  '/payments': ['recording-payments', 'payment-methods'],
  '/invoices': ['generating-invoices', 'invoice-templates'],
  '/settings': ['organization-settings', 'team-management'],
};

export function HelpWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const relevantArticles = helpMapping[location.pathname] || [];
  
  return (
    <div className="help-widget">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      
      {isOpen && (
        <div className="help-dropdown">
          <h4>Need help?</h4>
          <ul>
            {relevantArticles.map(slug => (
              <HelpArticleLink key={slug} slug={slug} />
            ))}
          </ul>
          <a href="/help">Browse all articles →</a>
        </div>
      )}
    </div>
  );
}
```

### Tooltips

Add contextual tooltips to complex features:

```tsx
export function Tooltip({ content, children }) {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

// Usage
<Tooltip content="This is the profit you'll make on this order">
  <InfoIcon className="h-4 w-4" />
</Tooltip>
```

---

## 14.3 Contact Form

### Contact Form Fields

| Field | Type | Required |
|-------|------|----------|
| Subject | select | ✅ |
| Message | textarea | ✅ |
| Name | text | ✅ (pre-filled) |
| Email | email | ✅ (pre-filled) |
| Organization | text | Auto |
| Attachments | file | ❌ |

### Subject Categories

- General Question
- Technical Issue
- Billing Question
- Feature Request
- Bug Report
- Other

### Database Schema

```sql
CREATE TABLE support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT NOT NULL UNIQUE,
  
  -- User info
  user_id TEXT REFERENCES user(id),
  organization_id TEXT REFERENCES organization(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  
  -- Ticket info
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT, -- JSON array of R2 keys
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')
  ),
  priority TEXT DEFAULT 'normal' CHECK (
    priority IN ('low', 'normal', 'high', 'urgent')
  ),
  
  -- Assignment
  assigned_to TEXT, -- Admin user ID
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  first_response_at TEXT
);

CREATE TABLE ticket_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id),
  
  -- Reply info
  user_id TEXT REFERENCES user(id),
  is_admin INTEGER DEFAULT 0,
  message TEXT NOT NULL,
  attachments TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support/tickets` | List user's tickets |
| POST | `/api/support/tickets` | Create ticket |
| GET | `/api/support/tickets/:id` | Get ticket details |
| POST | `/api/support/tickets/:id/reply` | Reply to ticket |
| PATCH | `/api/support/tickets/:id/close` | Close ticket |

---

## 14.4 Ticket System

### Ticket Workflow

```
┌────────┐     ┌─────────────┐     ┌─────────┐     ┌──────────┐
│  Open  │────▶│ In Progress │────▶│ Waiting │────▶│ Resolved │
└────────┘     └─────────────┘     └─────────┘     └──────────┘
     │                │                  │               │
     │                │                  │               ▼
     │                │                  │          ┌────────┐
     └────────────────┴──────────────────┴─────────▶│ Closed │
                                                     └────────┘
```

### Email Notifications

| Event | Notification |
|-------|--------------|
| Ticket created | Confirmation to user + Admin alert |
| Admin reply | Notify user |
| User reply | Notify assigned admin |
| Ticket resolved | Notify user with survey |
| Ticket closed | Final confirmation |

### SLA Metrics

| Priority | First Response | Resolution |
|----------|---------------|------------|
| Urgent | 2 hours | 24 hours |
| High | 4 hours | 48 hours |
| Normal | 24 hours | 5 days |
| Low | 48 hours | 10 days |

---

## 14.5 Live Chat

### Integration Options

| Provider | Pricing | Features |
|----------|---------|----------|
| Crisp | Free (2 seats) | Chat, chatbot, KB |
| Intercom | $74/mo | Full suite |
| Tawk.to | Free | Basic chat |
| Zendesk | $49/mo/agent | Enterprise |

### Crisp Integration

```html
<!-- Crisp Chat Widget -->
<script type="text/javascript">
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = "your-website-id";
  (function(){
    d = document;
    s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();
</script>
```

### User Identification

```typescript
// Identify logged-in users
useEffect(() => {
  if (user && window.$crisp) {
    window.$crisp.push(['set', 'user:email', [user.email]]);
    window.$crisp.push(['set', 'user:nickname', [user.name]]);
    window.$crisp.push(['set', 'session:data', [
      [['organization', activeOrg?.name]],
      [['plan', subscription?.plan]],
    ]]);
  }
}, [user, activeOrg, subscription]);
```

---

## 14.6 WhatsApp Integration

### WhatsApp Business API

For order notifications and support:

```typescript
// Send order status update via WhatsApp
async function sendWhatsAppNotification(
  phone: string,
  templateName: string,
  params: Record<string, string>
) {
  const response = await fetch(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: Object.entries(params).map(([_, value]) => ({
                type: 'text',
                text: value,
              })),
            },
          ],
        },
      }),
    }
  );
  
  return response.json();
}
```

### WhatsApp Templates

| Template | Message |
|----------|---------|
| `order_confirmation` | "Hi {{name}}, your order #{{order_number}} has been received!" |
| `order_ready` | "Good news! Your order #{{order_number}} is ready for pickup." |
| `payment_received` | "We received your payment of ₱{{amount}}. Thank you!" |
| `invoice_reminder` | "Reminder: Invoice #{{invoice_number}} (₱{{amount}}) is due on {{date}}." |

---

## 14.7 Status Page

### Status Page Content

```
https://status.pabili.app

┌─────────────────────────────────────────────────┐
│             Pabili System Status                │
│                                                 │
│  ✅ All Systems Operational                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  🟢 Web Application      Operational            │
│  🟢 API                   Operational            │
│  🟢 Database             Operational            │
│  🟢 File Storage         Operational            │
│  🟢 Authentication       Operational            │
│                                                 │
├─────────────────────────────────────────────────┤
│  Recent Incidents                               │
│                                                 │
│  No incidents reported in the last 7 days      │
└─────────────────────────────────────────────────┘
```

### Status Options

| Status | Color | Description |
|--------|-------|-------------|
| Operational | 🟢 Green | Everything working |
| Degraded | 🟡 Yellow | Partial issues |
| Partial Outage | 🟠 Orange | Some features down |
| Major Outage | 🔴 Red | Critical issues |
| Maintenance | 🔵 Blue | Planned maintenance |

### Implementation Options

- [Upptime](https://upptime.js.org/) - Free, GitHub-based
- [Instatus](https://instatus.com/) - Free tier available
- [Custom](https://status.pabili.app) - Build own status page

---

## Support Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| First Response Time | < 4 hours | Time to first reply |
| Resolution Time | < 48 hours | Time to resolve |
| CSAT Score | > 90% | Customer satisfaction |
| Help Article Views | Track | Self-service usage |
| Ticket Volume | Track | Support load |
| Tickets Deflected | Track | Self-service success |
