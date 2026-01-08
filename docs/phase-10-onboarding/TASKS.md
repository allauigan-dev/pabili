# Phase 10: Onboarding & Customer Success - Tasks

## 10.1 Email Verification

- [ ] Configure Better Auth email verification settings
- [ ] Create email verification template
- [ ] Create welcome email template
- [ ] Build verification pending page UI
- [ ] Implement resend verification endpoint
- [ ] Test email verification flow

## 10.2 Organization Setup Wizard

- [ ] Add onboarding columns to organization table
- [ ] Generate and apply migration
- [ ] Create onboarding status endpoint
- [ ] Build wizard container component
- [ ] Create Step 1: Business Info form
- [ ] Create Step 2: URL Slug form with validation
- [ ] Create Step 3: Branding/Logo upload (optional)
- [ ] Create Step 4: Settings (timezone, currency)
- [ ] Implement progress bar component
- [ ] Add skip button for optional steps
- [ ] Test complete wizard flow

## 10.3 Welcome Tour

- [ ] Install or create tour library
- [ ] Define tour steps for dashboard
- [ ] Create tour step content
- [ ] Create user_tours table
- [ ] Implement useTour hook
- [ ] Add "Skip Tour" option
- [ ] Add "Restart Tour" in settings
- [ ] Test tour on first login

## 10.4 Sample Data

- [ ] Define sample stores data
- [ ] Define sample customers data
- [ ] Define sample orders data
- [ ] Create sample data insertion endpoint
- [ ] Create sample data deletion endpoint
- [ ] Add "Populate with sample data" option in wizard
- [ ] Add "Clear sample data" option in settings
- [ ] Mark sample data records for identification

## 10.5 Progress Checklist

- [ ] Create onboarding_progress table
- [ ] Generate and apply migration
- [ ] Create checklist status endpoint
- [ ] Implement progress calculation logic
- [ ] Add trigger on store creation
- [ ] Add trigger on customer creation
- [ ] Add trigger on order creation
- [ ] Add trigger on payment creation
- [ ] Add trigger on team invite
- [ ] Build checklist UI component
- [ ] Show checklist on dashboard until complete
- [ ] Add celebration animation on 100%

## 10.6 Trial Management

- [ ] Add trial_ends_at column to subscriptions
- [ ] Configure trial duration (14 days)
- [ ] Create trial status endpoint
- [ ] Build trial banner component
- [ ] Implement trial expiry countdown
- [ ] Create trial extension endpoint (one-time)
- [ ] Add trial expiry notifications
- [ ] Implement grace period logic
- [ ] Create scheduled job for trial expiry check
- [ ] Test full trial lifecycle

## 10.7 Health Scores (Admin Portal)

- [ ] Define health score metrics
- [ ] Implement activity score calculation
- [ ] Implement engagement score calculation
- [ ] Implement growth score calculation
- [ ] Implement payment score calculation
- [ ] Implement setup score calculation
- [ ] Create health score calculation endpoint
- [ ] Build health score dashboard (admin)
- [ ] Add health score to tenant list view
- [ ] Schedule daily health score updates

## 10.8 Churn Risk Alerts

- [ ] Define churn risk indicators
- [ ] Create churn risk detection function
- [ ] Implement daily churn check cron job
- [ ] Create admin alerts table
- [ ] Build admin alerts UI
- [ ] Add email notifications for critical risks
- [ ] Create at-risk tenant report
- [ ] Test churn detection logic

## Verification

- [ ] Test complete onboarding flow (new user)
- [ ] Test organization setup wizard
- [ ] Verify welcome tour functionality
- [ ] Test sample data creation/deletion
- [ ] Verify progress checklist accuracy
- [ ] Test trial expiry flow
- [ ] Verify health score calculations
- [ ] Test churn risk detection
