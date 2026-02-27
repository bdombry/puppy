# 🔧 PupyTracker Issues - Diagnostic & Fix Guide

## 🐕 Problème #1: Table `Dogs` ne se remplit pas

### Root Cause
La table `Dogs` n'existe pas dans Supabase. Le fichier SQL `create_dogs_table.sql` a été créé mais pas encore exécuté.

### Solution

#### Step 1: Execute the SQL in Supabase
1. Go to: https://supabase.com/dashboard/project/[your-project]/sql
2. Click **"New Query"** 
3. Copy the entire content of `supabase_functions/create_dogs_table.sql`
4. Paste into the SQL editor
5. Click **"Run"** ✅

**Expected result:** "Query executed successfully"

#### Step 2: Verify Table Creation
```sql
-- Run this query to verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'Dogs';
```

Should return: `Dogs`

#### Step 3: Verify RLS Policies
```sql
-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'Dogs';
```

Should show 4 policies:
- Users can view their own dogs
- Users can insert their own dogs
- Users can update their own dogs
- Users can delete their own dogs

---

## 💳 Problème #2: RevenueCat Error

### Error Message
```
"there is an issue with your configuration no product registered 
in RevenueCat dashboard could be fetched from App Store connect"
```

### Root Cause
- ❌ No products created on App Store Connect
- ❌ No products added to RevenueCat
- ❌ No Offering configured
- ❌ RevenueCat SDK not initialized properly

### Solution

Follow the complete guide in: **REVENUCAT_PRODUCTS_SETUP.md**

**Quick Checklist:**

1. **App Store Connect**
   - [ ] Create Subscription Group: `pupytracker_premium`
   - [ ] Create Monthly: `com.bendombry.pupytracker.premium.monthly`
   - [ ] Create Yearly: `com.bendombry.pupytracker.premium.yearly`

2. **RevenueCat Dashboard**
   - [ ] Add Monthly product
   - [ ] Add Yearly product
   - [ ] Create Entitlement: `PupyTracker Pro`
   - [ ] Create Offering ID: `default`
   - [ ] Link both products to offering
   - [ ] Set offering as "Current"

3. **Superwall Dashboard**
   - [ ] Connect RevenueCat (with Public API Key)

4. **App Store Connect Webhooks**
   - [ ] Add webhook: https://api.revenuecat.com/webhooks/integrations/app-store-connect

---

## 🧪 Test Your Setup

### Test #1: Check Dogs Table (After SQL execution)
```javascript
// In CreateAccountScreen or anywhere:
const { data, error } = await supabase
  .from('Dogs')
  .select('*')
  .limit(1);

if (error) console.error('❌ Dogs table issue:', error.message);
else console.log('✅ Dogs table accessible');
```

### Test #2: Check RevenueCat (In DebugRevenueCatScreen)
Look for:
- ✅ Loading: false
- ✅ Offerings: loaded
- ✅ Packages count: 2 (monthly + yearly)
- ✅ No error messages

### Test #3: Full Flow Test
1. Register new user
2. Complete onboarding
3. Should reach paywall screen
4. Should see both monthly & yearly options
5. Can click to purchase (sandbox mode)

---

## 📋 Files to Review

| File | Purpose |
|------|---------|
| `supabase_functions/create_dogs_table.sql` | Execute this in Supabase SQL editor |
| `REVENUCAT_PRODUCTS_SETUP.md` | Step-by-step product configuration |
| `components/screens/CreateAccountScreen.js` | Saves dog to DB (line ~100) |
| `components/screens/DebugRevenueCatScreen.js` | Test RevenueCat setup |
| `services/revenueCatService.js` | RevenueCat SDK configuration |

---

## 🚀 Next Steps

1. **Execute `create_dogs_table.sql` in Supabase** ← DO THIS FIRST
2. Test that new users can create dogs
3. Follow REVENUCAT_PRODUCTS_SETUP.md for paywall
4. Use DebugRevenueCatScreen to verify offerings load
5. Test full onboarding flow

---

## 💬 Common Issues After Fix

### Issue: "Dogs still not saving"
- [ ] SQL not actually executed
- [ ] RLS policies blocking inserts
- [ ] Check browser console for exact error

**Debug:**
```javascript
console.log('Dog data:', { userId, dogName, breed });
// Look for error.message details
```

### Issue: "Still no offerings"
- [ ] Products not in App Store Connect
- [ ] Products not added to RevenueCat
- [ ] RevenueCat SDK not initialized

**Debug:**
Check `DebugRevenueCatScreen` for exact error

---

## 📞 Need Help?

Check:
- `KEYS_AUDIT.md` - API key verification
- `REVENUECAT_SETUP.md` - Original setup guide
- `REVENUCAT_PRODUCTS_SETUP.md` - Detailed product creation

