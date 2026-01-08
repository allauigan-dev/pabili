# Phase 10: Onboarding & Customer Success

> **Priority:** 🟠 High | **Estimated Effort:** 2-3 weeks

## Overview

Implement a comprehensive onboarding experience that guides new users through setup and helps ensure long-term customer success. This phase aligns with the onboarding flow defined in `spec.md`.

---

## 10.1 Email Verification

### Implementation

Better Auth handles email verification. Ensure it's enforced:

```typescript
// Auth configuration
export const getAuth = (env: Env) => betterAuth({
  // ...
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 24 * 60 * 60, // 24 hours
  },
  // ...
});
```

### Email Templates

| Template | Subject | Trigger |
|----------|---------|---------|
| Verification | Verify your Pabili account | Sign up |
| Welcome | Welcome to Pabili! | After verification |
| Resend | Your verification link | User requests |

### UI Flow

```
Sign Up → Verification Pending Page → Check Email → Click Link → Verified → Create Org
```

---

## 10.2 Organization Setup Wizard

### Setup Steps (from spec.md)

| Step | Fields | Required |
|------|--------|----------|
| 1. Business Info | Organization name | ✅ |
| 2. Slug | URL slug (auto-generated) | ✅ |
| 3. Branding | Logo upload | ❌ |
| 4. Settings | Timezone, Currency | ✅ (defaults available) |

### Database Schema Addition

```sql
-- Track onboarding progress
ALTER TABLE organization ADD COLUMN onboarding_completed INTEGER DEFAULT 0;
ALTER TABLE organization ADD COLUMN onboarding_step TEXT DEFAULT 'business_info';
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/onboarding/status` | Get current onboarding step |
| POST | `/api/onboarding/business-info` | Save step 1 |
| POST | `/api/onboarding/slug` | Save step 2 |
| POST | `/api/onboarding/branding` | Save step 3 (optional) |
| POST | `/api/onboarding/settings` | Save step 4 |
| POST | `/api/onboarding/complete` | Mark onboarding complete |

### Implementation

```typescript
// Onboarding wizard component
export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  
  const steps = [
    { id: 'business_info', title: 'Business Info', component: BusinessInfoStep },
    { id: 'slug', title: 'Your URL', component: SlugStep },
    { id: 'branding', title: 'Branding', component: BrandingStep, optional: true },
    { id: 'settings', title: 'Settings', component: SettingsStep },
  ];
  
  return (
    <div className="onboarding-wizard">
      <ProgressBar current={step} total={steps.length} />
      <StepComponent {...steps[step - 1]} onNext={() => setStep(s => s + 1)} />
    </div>
  );
}
```

---

## 10.3 Welcome Tour

### Tour Stops

| Stop | Element | Message |
|------|---------|---------|
| 1 | Dashboard | "This is your command center. See all your orders at a glance." |
| 2 | Quick Actions | "Create orders, add customers, and manage stores from here." |
| 3 | Orders Tab | "Track all your pasabuy orders in one place." |
| 4 | Customers Tab | "Manage your resellers and track their balances." |
| 5 | Stores Tab | "Add the stores you purchase from." |
| 6 | Settings | "Customize your organization settings here." |

### Implementation

Use a lightweight tour library:

```typescript
import { useTour } from '@/hooks/useTour';

const tourSteps = [
  {
    target: '.dashboard-overview',
    content: 'This is your command center. See all your orders at a glance.',
    placement: 'bottom',
  },
  // ... more steps
];

export function DashboardPage() {
  const { startTour, isFirstVisit } = useTour('dashboard');
  
  useEffect(() => {
    if (isFirstVisit) {
      startTour(tourSteps);
    }
  }, [isFirstVisit]);
  
  return <Dashboard />;
}
```

### Tour Preferences

```sql
-- Track tour completion
CREATE TABLE user_tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES user(id),
  tour_id TEXT NOT NULL, -- 'dashboard', 'orders', 'customers'
  completed_at TEXT,
  skipped INTEGER DEFAULT 0,
  UNIQUE(user_id, tour_id)
);
```

---

## 10.4 Sample Data

### Demo Data Option

During onboarding, offer to populate with sample data:

```typescript
const sampleData = {
  stores: [
    { store_name: 'Sample Store 1', store_address: 'Manila' },
    { store_name: 'Sample Store 2', store_address: 'Cebu' },
  ],
  customers: [
    { customer_name: 'Demo Customer 1', customer_phone: '+63 912 345 6789' },
    { customer_name: 'Demo Customer 2', customer_phone: '+63 917 123 4567' },
  ],
  orders: [
    { order_name: 'Sample Product', order_quantity: 2, order_price: 500 },
  ],
};

app.post('/api/onboarding/sample-data', requireAuth, async (c) => {
  const orgId = c.get('organizationId');
  
  // Insert sample data
  await insertSampleData(db, orgId, sampleData);
  
  return c.json({ success: true, message: 'Sample data created' });
});
```

### Clear Sample Data

```typescript
app.delete('/api/onboarding/sample-data', requireAuth, async (c) => {
  const orgId = c.get('organizationId');
  
  // Remove all data marked as sample
  await clearSampleData(db, orgId);
  
  return c.json({ success: true });
});
```

---

## 10.5 Progress Checklist

### Setup Checklist Items

| Item | Trigger | Weight |
|------|---------|--------|
| Complete profile | User updates name/image | 10% |
| Create first store | Store created | 20% |
| Add first customer | Customer created | 20% |
| Create first order | Order created | 25% |
| Record first payment | Payment recorded | 15% |
| Invite team member | Invitation sent | 10% |

### Database Schema

```sql
CREATE TABLE onboarding_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL REFERENCES organization(id) UNIQUE,
  
  -- Checklist items
  profile_completed INTEGER DEFAULT 0,
  first_store_created INTEGER DEFAULT 0,
  first_customer_created INTEGER DEFAULT 0,
  first_order_created INTEGER DEFAULT 0,
  first_payment_recorded INTEGER DEFAULT 0,
  team_member_invited INTEGER DEFAULT 0,
  
  -- Progress
  progress_percentage INTEGER DEFAULT 0,
  checklist_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/onboarding/checklist` | Get checklist status |
| POST | `/api/onboarding/checklist/:item` | Mark item complete |

### UI Component

```tsx
export function OnboardingChecklist() {
  const { data: progress } = useOnboardingProgress();
  
  return (
    <Card className="onboarding-checklist">
      <h3>Getting Started ({progress.percentage}%)</h3>
      <ProgressBar value={progress.percentage} />
      
      <ChecklistItem 
        completed={progress.first_store_created}
        label="Add your first store"
        action={() => navigate('/stores/new')}
      />
      {/* ... more items */}
    </Card>
  );
}
```

---

## 10.6 Trial Management

### Trial Configuration

| Setting | Value |
|---------|-------|
| Trial Duration | 14 days |
| Trial Plan | Pro features |
| Grace Period | 3 days after expiry |
| Conversion Goal | Upgrade to paid plan |

### Database Schema

```sql
-- Add to subscriptions table
ALTER TABLE subscriptions ADD COLUMN trial_ends_at TEXT;
ALTER TABLE subscriptions ADD COLUMN trial_extended INTEGER DEFAULT 0;
```

### Trial Status Endpoint

```typescript
app.get('/api/billing/trial-status', requireAuth, async (c) => {
  const orgId = c.get('organizationId');
  const subscription = await getSubscription(db, orgId);
  
  if (!subscription.trial_ends_at) {
    return c.json({ success: true, data: { inTrial: false } });
  }
  
  const trialEnds = new Date(subscription.trial_ends_at);
  const daysLeft = Math.ceil((trialEnds - Date.now()) / (1000 * 60 * 60 * 24));
  
  return c.json({
    success: true,
    data: {
      inTrial: true,
      trialEndsAt: subscription.trial_ends_at,
      daysLeft: Math.max(0, daysLeft),
      canExtend: !subscription.trial_extended,
    }
  });
});
```

### Trial Expiry Notifications

| Days Left | Notification |
|-----------|--------------|
| 7 | "Your trial ends in 7 days" |
| 3 | "Your trial ends in 3 days - upgrade now!" |
| 1 | "Last day of your trial!" |
| 0 | "Trial expired - upgrade to continue" |
| -3 | Grace period ends, downgrade to Free |

---

## 10.7 Health Scores (Admin Portal)

### Tenant Health Metrics

| Metric | Weight | Calculation |
|--------|--------|-------------|
| Activity | 30% | Orders created in last 7 days |
| Engagement | 25% | Daily active users |
| Growth | 20% | Order volume trend |
| Payment | 15% | Subscription status |
| Setup | 10% | Onboarding completion |

### Health Score Calculation

```typescript
export async function calculateHealthScore(
  db: DrizzleDB,
  orgId: string
): Promise<number> {
  const [activity, engagement, growth, payment, setup] = await Promise.all([
    getActivityScore(db, orgId),      // 0-100
    getEngagementScore(db, orgId),    // 0-100
    getGrowthScore(db, orgId),        // 0-100
    getPaymentScore(db, orgId),       // 0-100
    getSetupScore(db, orgId),         // 0-100
  ]);
  
  return Math.round(
    activity * 0.30 +
    engagement * 0.25 +
    growth * 0.20 +
    payment * 0.15 +
    setup * 0.10
  );
}
```

### Health Score Categories

| Score | Category | Color | Action |
|-------|----------|-------|--------|
| 80-100 | Healthy | 🟢 Green | Monitor |
| 60-79 | At Risk | 🟡 Yellow | Reach out |
| 40-59 | Unhealthy | 🟠 Orange | Urgent outreach |
| 0-39 | Churning | 🔴 Red | Retention campaign |

---

## 10.8 Churn Risk Alerts

### Churn Indicators

| Indicator | Weight | Threshold |
|-----------|--------|-----------|
| No login in 7+ days | High | Flag if true |
| No orders in 14+ days | High | Flag if true |
| Failed payment | Critical | Immediate alert |
| Cancelled subscription | Critical | Immediate alert |
| Support tickets | Medium | 3+ in 7 days |

### Scheduled Churn Check

```typescript
// Cloudflare Cron Trigger - Daily at 9 AM
export default {
  async scheduled(event, env, ctx) {
    const db = createDb(env.DB);
    
    // Find at-risk tenants
    const atRiskOrgs = await findAtRiskOrganizations(db);
    
    for (const org of atRiskOrgs) {
      // Create admin notification
      await createAdminAlert(db, {
        type: 'churn_risk',
        organizationId: org.id,
        riskLevel: org.riskLevel,
        indicators: org.indicators,
      });
    }
  }
};
```

---

## Onboarding Metrics to Track

| Metric | Target | Description |
|--------|--------|-------------|
| Activation Rate | 70% | Users who complete onboarding |
| Time to First Order | < 24 hours | Speed of first value |
| Trial Conversion | 5-10% | Trial to paid |
| Checklist Completion | 80% | Full setup completion |
| Tour Completion | 60% | Users who finish tour |
