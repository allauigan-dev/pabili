# Phase 13: Marketing & Growth

> **Priority:** 🟢 Nice to Have | **Estimated Effort:** 2-3 weeks

## Overview

Implement marketing infrastructure to attract and convert new users, including a landing page, SEO optimization, and growth features.

---

## 13.1 Landing Page

### Page Structure

```
/                    → Main landing page
/pricing             → Pricing comparison
/features            → Feature showcase
/about               → About Pabili
/blog                → (Future) Blog/content
```

### Landing Page Sections

| Section | Content |
|---------|---------|
| Hero | Headline, subheadline, CTA buttons |
| Features | Key features with icons |
| How It Works | 3-step process |
| Testimonials | Customer quotes |
| Pricing | Plan comparison table |
| FAQ | Common questions |
| CTA | Final sign-up prompt |

### Implementation

Create a separate static site or integrate with main app:

```typescript
// Landing pages (unauthenticated)
app.get('/', (c) => {
  // Check if user is logged in
  const session = c.get('session');
  if (session) {
    return c.redirect('/dashboard');
  }
  return c.html(renderLandingPage());
});
```

### Hero Section Design

```jsx
export function HeroSection() {
  return (
    <section className="hero">
      <h1>Manage Your Pasabuy Business Like a Pro</h1>
      <p>
        Track orders, manage customers, and grow your business with the 
        #1 pasabuy order management system in the Philippines.
      </p>
      <div className="hero-cta">
        <Button size="lg" onClick={() => navigate('/signup')}>
          Start Free Trial
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/demo')}>
          Watch Demo
        </Button>
      </div>
      <p className="hero-note">No credit card required • 14-day free trial</p>
    </section>
  );
}
```

---

## 13.2 SEO Optimization

### Meta Tags

```html
<!-- Primary Meta Tags -->
<title>Pabili - Pasabuy Order Management System | Philippines</title>
<meta name="title" content="Pabili - Pasabuy Order Management System">
<meta name="description" content="Track orders, manage customers, and grow your pasabuy business. Free order management system for Filipino entrepreneurs.">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://pabili.app/">
<meta property="og:title" content="Pabili - Pasabuy Order Management System">
<meta property="og:description" content="Track orders, manage customers, and grow your pasabuy business.">
<meta property="og:image" content="https://pabili.app/og-image.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://pabili.app/">
<meta property="twitter:title" content="Pabili - Pasabuy Order Management System">
<meta property="twitter:image" content="https://pabili.app/twitter-image.png">
```

### Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Pabili",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "PHP"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "100"
  }
}
</script>
```

### Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pabili.app/</loc>
    <lastmod>2026-01-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pabili.app/pricing</loc>
    <lastmod>2026-01-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pabili.app/features</loc>
    <lastmod>2026-01-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Sitemap: https://pabili.app/sitemap.xml
```

---

## 13.3 Referral Program

### Referral Mechanics

| Reward Type | Referrer | Referee |
|-------------|----------|---------|
| Credits | ₱500 credit | ₱500 credit |
| Trigger | Referee upgrades to paid | On first paid month |
| Limit | Unlimited referrals | One-time |

### Database Schema

```sql
CREATE TABLE referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_user_id TEXT NOT NULL REFERENCES user(id),
  referee_user_id TEXT REFERENCES user(id),
  
  -- Referral code
  code TEXT NOT NULL UNIQUE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'signed_up', 'converted', 'rewarded')
  ),
  
  -- Rewards
  referrer_reward_amount INTEGER, -- in centavos
  referee_reward_amount INTEGER,
  referrer_rewarded_at TEXT,
  referee_rewarded_at TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  signed_up_at TEXT,
  converted_at TEXT
);

CREATE TABLE referral_credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES user(id),
  organization_id TEXT REFERENCES organization(id),
  
  amount INTEGER NOT NULL, -- in centavos
  type TEXT NOT NULL, -- 'referral_bonus', 'promo_credit'
  source TEXT, -- 'referral:{referral_id}', 'promo:{code}'
  
  expires_at TEXT,
  used_at TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_code ON referrals(code);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referrals` | Get referral stats |
| POST | `/api/referrals/code` | Generate referral code |
| GET | `/api/referrals/check/:code` | Validate referral code |
| POST | `/api/referrals/apply` | Apply referral on signup |

### Referral Link

```
https://pabili.app/r/{referral_code}

Example: https://pabili.app/r/JUAN2026
```

---

## 13.4 Testimonials System

### Database Schema

```sql
CREATE TABLE testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Author info
  author_name TEXT NOT NULL,
  author_title TEXT, -- "Owner, Juan's Pasabuy"
  author_image TEXT,
  author_organization_id TEXT REFERENCES organization(id),
  
  -- Content
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Display
  is_featured INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Testimonial Collection

Prompt happy customers to leave testimonials:

```typescript
// Check if user is eligible for testimonial prompt
async function shouldPromptTestimonial(userId: string, orgId: string) {
  const org = await getOrganization(orgId);
  
  // Active for > 30 days
  const daysSinceCreated = daysSince(org.created_at);
  if (daysSinceCreated < 30) return false;
  
  // Has > 50 orders
  const orderCount = await getOrderCount(orgId);
  if (orderCount < 50) return false;
  
  // Hasn't been prompted recently
  const lastPrompt = await getLastTestimonialPrompt(userId);
  if (lastPrompt && daysSince(lastPrompt) < 90) return false;
  
  return true;
}
```

---

## 13.5 Email Marketing

### Email Sequences

| Sequence | Trigger | Emails |
|----------|---------|--------|
| Welcome | Sign up | 5 emails over 14 days |
| Trial Ending | 3 days before | 3 emails |
| Abandoned Cart | Started signup, didn't finish | 2 emails |
| Win-Back | Churned 30 days ago | 3 emails |
| Feature Announcement | New feature launch | 1 email |

### Welcome Sequence

| Day | Subject | Content |
|-----|---------|---------|
| 0 | Welcome to Pabili! | Getting started guide |
| 2 | Set up your first store | Store creation tutorial |
| 5 | Add your customers | Customer management tips |
| 9 | Create your first order | Order workflow guide |
| 13 | Your trial ends tomorrow | Upgrade CTA |

### Implementation

Use Resend, SendGrid, or Cloudflare Email Workers:

```typescript
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);

async function sendWelcomeEmail(user: User) {
  await resend.emails.send({
    from: 'Pabili <hello@pabili.app>',
    to: user.email,
    subject: 'Welcome to Pabili! 🎉',
    html: renderEmailTemplate('welcome', { name: user.name }),
  });
}
```

---

## 13.6 Analytics Integration

### Google Analytics 4

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Key Events to Track

| Event | Trigger | Parameters |
|-------|---------|------------|
| `sign_up` | User registers | method (google/email) |
| `login` | User logs in | method |
| `create_organization` | Org created | - |
| `create_order` | Order created | order_value |
| `upgrade` | Plan upgrade | plan_name, value |
| `invite_member` | Team invite | - |

### Mixpanel (Optional)

For product analytics:

```typescript
import mixpanel from 'mixpanel-browser';

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN);

// Track events
mixpanel.track('Order Created', {
  order_value: order.order_customer_total,
  order_status: order.order_status,
});

// Identify user
mixpanel.identify(user.id);
mixpanel.people.set({
  $name: user.name,
  $email: user.email,
  plan: subscription.plan,
  organization_id: org.id,
});
```

---

## 13.7 Social Proof

### Live Activity Feed

Show recent sign-ups/activity to build trust:

```jsx
export function SocialProofFeed() {
  const [activities, setActivities] = useState([]);
  
  // Fetch recent public activities
  useEffect(() => {
    fetchRecentActivity().then(setActivities);
  }, []);
  
  return (
    <div className="social-proof-feed">
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <img src={activity.avatar} alt="" />
          <span>
            <strong>{activity.name}</strong> from {activity.location} 
            just signed up!
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Trust Badges

Display on landing page:
- "Trusted by 500+ businesses"
- "10,000+ orders processed"
- "4.8★ average rating"
- "Philippine-made product"

---

## Conversion Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Signup Rate | 5% | Visitors → Signups |
| Activation Rate | 70% | Signups → Complete onboarding |
| Trial Conversion | 8% | Trial → Paid |
| Referral Rate | 15% | Users who refer others |
| Churn Rate | < 5% | Monthly churn |
