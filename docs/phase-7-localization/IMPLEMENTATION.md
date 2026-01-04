# Phase 7: Localization & Philippine Market

> **Priority:** 🟢 Nice to Have | **Estimated Effort:** 1-2 weeks

## 7.1 Language Support

### Filipino/Tagalog UI
- Translate all UI text to Filipino
- Use i18n library (react-i18next)
- Create language files: `en.json`, `fil.json`

### Language Switcher
- Add language toggle in settings
- Store preference in localStorage
- Apply on app load

---

## 7.2 Payment Methods

### GCash QR Code
- Generate QR code for payment amount
- Display in invoice/payment page
- Deep link to GCash app

### Maya Integration
- Create Maya payment links
- Display QR for Maya payments

### Bank Transfer Templates
- Pre-filled payment instructions per bank
- Copy account details button
- Show BPI, BDO, UnionBank details

---

## 7.3 Logistics Integration (Future)

### Delivery Partners
- Grab Express quote API
- Lalamove quote API
- Show estimated delivery cost

### Shipping Calculator
- Calculate based on origin/destination
- Add to order total

### Tracking
- Store courier tracking number
- Link to courier tracking page
