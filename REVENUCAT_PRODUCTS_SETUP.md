# 🛍️ RevenueCat Products Setup - Step by Step

## 📌 IMPORTANT: Order of Operations

Products **MUST** be created in this order:
1. **Apple App Store Connect** - Create products
2. **RevenueCat Dashboard** - Add products
3. **RevenueCat Dashboard** - Create Entitlements
4. **RevenueCat Dashboard** - Create Offerings

---

## ✅ Step 1: Create Products on App Store Connect

**URL:** https://appstoreconnect.apple.com/apps

### For PupyTracker:
1. Go to your app
2. Click **"Subscriptions"** (under In-App Purchases)
3. Create a **Subscription Group** called `pupytracker_premium`
4. Inside this group, create TWO subscriptions:

#### Subscription 1: Monthly
- **Reference Name:** `PupyTracker Premium Monthly`
- **Product ID:** `com.bendombry.pupytracker.premium.monthly`
- **Subscription Type:** Auto-Renewable
- **Duration:** One month
- **Price:** Choose your price (e.g., $4.99)
- **Billing Event:** Renews every month
- **Cancellation Period:** Allow 3-day free trial if desired

#### Subscription 2: Yearly
- **Reference Name:** `PupyTracker Premium Yearly`
- **Product ID:** `com.bendombry.pupytracker.premium.yearly`
- **Subscription Type:** Auto-Renewable
- **Duration:** One year
- **Price:** Choose your price (e.g., $39.99)
- **Billing Event:** Renews every year
- **Cancellation Period:** Allow 3-day free trial if desired

✅ **Save both products**

---

## ✅ Step 2: Add Products to RevenueCat

**URL:** https://dashboard.revenuecat.com/products

1. Click **"Add Product"**
2. For each product:
   - **Product ID:** Copy from App Store Connect (exact match!)
   - **Type:** Subscription (Auto-Renewable)
   - Select **App Store** as platform
3. The products should now appear in RevenueCat Dashboard

**Status Check:** You should see both products listed.

---

## ✅ Step 3: Create Entitlements in RevenueCat

**URL:** https://dashboard.revenuecat.com/entitlements

1. Click **"Add Entitlement"**
2. **Name:** `PupyTracker Pro`
3. **Description:** Premium features for PupyTracker
4. Click **"Save"**

**Status Check:** Entitlement should appear in list.

---

## ✅ Step 4: Create Offering in RevenueCat

**URL:** https://dashboard.revenuecat.com/offerings

1. Click **"Create Offering"**
2. **Identifier:** `default` (this is what the app fetches)
3. **Packages:** Add both products:
   - Package 1: Type = Monthly, Product = `com.bendombry.pupytracker.premium.monthly`
   - Package 2: Type = Annual, Product = `com.bendombry.pupytracker.premium.yearly`
4. **Entitlements:** Assign `PupyTracker Pro` to BOTH packages
5. **Set as Current Offering:** Check this box
6. Click **"Save"**

**Status Check:** Offering should show as "Current"

---

## ✅ Step 5: Link Superwall to RevenueCat

**URL:** https://dashboard.superwall.com/integrations

1. Click **"RevenueCat"**
2. **API Key:** Paste your RevenueCat **Public API Key** (starts with `pk_`)
   - Find it at: https://dashboard.revenuecat.com/settings/app
   - Under "API Keys" section
3. Click **"Test Connection"** - should show ✅
4. Click **"Save"**

---

## ✅ Step 6: Configure Webhooks (App Store Connect → RevenueCat)

**URL:** https://appstoreconnect.apple.com/apps/settings/webhooks

1. Click **"Create New URL"** (or edit existing)
2. **Webhook URL:** 
   ```
   https://api.revenuecat.com/webhooks/integrations/app-store-connect
   ```
3. **Events to Subscribe:**
   - ✅ Subscription Renewal Diable
   - ✅ Subscription Renewal Extension
   - ✅ Subscription Event
   - ✅ Test Notification
4. Click **"Save"**

---

## 🧪 Test Your Setup

### Test 1: Check App Initializes RevenueCat
```javascript
// In App.js, check console logs:
// Should see: "✅ RevenueCat initialized successfully"
```

### Test 2: Check Offerings Load
Go to **DebugRevenueCatScreen** in your app:
- Should show "Offerings: loaded"
- Should list both monthly and yearly packages
- Should show prices

### Test 3: Test Purchase Flow
1. Click a package to purchase
2. Should open App Store payment sheet
3. Complete purchase in Test Flight
4. Should see "Pro" status enabled

---

## 🔧 Troubleshooting

### "No offerings available"
- ❌ Offering not set as "Current" in RevenueCat
- ❌ Products not properly linked in RevenueCat
- ❌ App Store Connect products not matching product IDs

### "Product not registered"
- ❌ Product ID doesn't match App Store Connect exactly
- ❌ Product not added to RevenueCat dashboard
- ❌ Check capitalization and special characters

### Sandbox user sees wrong pricing
- ❌ Price not synced from App Store Connect
- ❌ Refresh app and try again

---

## 📝 Checklist

- [ ] Monthly product created on App Store Connect
- [ ] Yearly product created on App Store Connect
- [ ] Both products added to RevenueCat
- [ ] `PupyTracker Pro` entitlement created
- [ ] Offering created with both packages
- [ ] Offering set as "Current"
- [ ] Superwall linked to RevenueCat
- [ ] Webhooks configured
- [ ] DebugRevenueCatScreen shows offerings
- [ ] Test purchase completed

