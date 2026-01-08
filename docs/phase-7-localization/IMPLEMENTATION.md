# Phase 7: Localization & Philippine Market

> **Priority:** 🟢 Nice to Have | **Estimated Effort:** 1-2 weeks

## Overview

Localization features tailored for the Philippine market, including language support, local payment methods, and multi-currency for OFW pasabuy businesses.

---

## 7.1 Language Support

### Filipino/Tagalog UI
- Translate all UI text to Filipino
- Use i18n library (react-i18next)
- Create language files: `en.json`, `fil.json`

### Language Switcher
- Add language toggle in settings
- Store preference in localStorage
- Apply on app load

### Implementation

```typescript
// i18n configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fil from './locales/fil.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fil: { translation: fil },
  },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
});

export default i18n;
```

### Translation Keys

| Key | English | Filipino |
|-----|---------|----------|
| `orders` | Orders | Mga Order |
| `customers` | Customers | Mga Customer |
| `payments` | Payments | Mga Bayad |
| `stores` | Stores | Mga Tindahan |
| `pending` | Pending | Naghihintay |
| `delivered` | Delivered | Naihatid |

---

## 7.2 Multi-Currency Support

### OFW Pasabuy Use Case

From spec.md: Support USD for OFW (Overseas Filipino Workers) pasabuy businesses that purchase items abroad.

### Currency Configuration

| Setting | Description |
|---------|-------------|
| Primary Currency | Organization's default (PHP) |
| Display Currency | User preference for viewing |
| Order Currency | Currency of the order |
| Exchange Rate | Manual or auto (API) |

### Database Schema Addition

```sql
-- Add currency support to orders
ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'PHP';
ALTER TABLE orders ADD COLUMN exchange_rate REAL DEFAULT 1;

-- Organization currency settings
ALTER TABLE organization ADD COLUMN default_currency TEXT DEFAULT 'PHP';
ALTER TABLE organization ADD COLUMN supported_currencies TEXT DEFAULT '["PHP"]'; -- JSON array
```

### Currency Formatting

```typescript
const currencies = {
  PHP: { symbol: '₱', locale: 'en-PH' },
  USD: { symbol: '$', locale: 'en-US' },
  AED: { symbol: 'د.إ', locale: 'ar-AE' },
  SGD: { symbol: 'S$', locale: 'en-SG' },
  HKD: { symbol: 'HK$', locale: 'en-HK' },
};

export function formatCurrency(amount: number, currency = 'PHP'): string {
  const config = currencies[currency] || currencies.PHP;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
```

### Exchange Rate Updates

Option 1: Manual entry by user
Option 2: Auto-update via free API (exchangerate-api.com)

```typescript
async function getExchangeRate(from: string, to: string): Promise<number> {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${from}`
  );
  const data = await response.json();
  return data.rates[to];
}
```

---

## 7.3 Payment Methods

### GCash QR Code
- Generate QR code for payment amount
- Display in invoice/payment page
- Deep link to GCash app: `gcash://`

### Maya Integration
- Create Maya payment links
- Display QR for Maya payments
- Deep link: `maya://`

### Bank Transfer Templates
- Pre-filled payment instructions per bank
- Copy account details button
- Show BPI, BDO, UnionBank, Metrobank details

### Implementation

```typescript
// Generate GCash deep link
function generateGCashLink(amount: number, reference: string): string {
  return `gcash://send?amount=${amount}&reference=${reference}`;
}

// Bank account template
const bankAccounts = {
  bpi: {
    name: 'Bank of the Philippine Islands',
    accountName: 'Your Business Name',
    accountNumber: '1234-5678-90',
  },
  bdo: {
    name: 'Banco de Oro',
    accountName: 'Your Business Name',
    accountNumber: '0012-3456-7890',
  },
};
```

---

## 7.4 Logistics Integration (Future)

> **Note:** Logistics integration is deprioritized for MVP. It may be added in a future release based on user demand.

### ~~Delivery Partners~~ (Future)
- Grab Express quote API
- Lalamove quote API
- Show estimated delivery cost

### ~~Shipping Calculator~~ (Future)
- Calculate based on origin/destination
- Add to order total

### Tracking (Simpler Alternative)
- Store courier tracking number
- Link to courier tracking page
- Manual entry by operator

---

## 7.5 Philippine-Specific Features

### Date/Time Formatting
- Default timezone: Asia/Manila
- Date format: MM/DD/YYYY (US style, common in PH)
- 12-hour time format

### Phone Number Formatting
- Validate Philippine phone numbers
- Support +63 and 09XX formats
- Auto-format on input

```typescript
function formatPhoneNumber(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle +63 format
  if (digits.startsWith('63')) {
    return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  
  // Handle 09XX format
  if (digits.startsWith('09')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
}
```

### Address Formatting
- Barangay, City, Province structure
- Region/NCR handling
- Zip code validation

---

## Feature Availability by Plan

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Language Switcher | ✅ | ✅ | ✅ |
| Multi-Currency | ❌ | ✅ | ✅ |
| GCash/Maya QR | ✅ | ✅ | ✅ |
| Bank Templates | ✅ | ✅ | ✅ |
| Logistics Integration | ❌ | ❌ | ✅ |
