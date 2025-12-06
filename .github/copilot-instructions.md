# PupyTracker - AI Coding Agent Instructions

## 🎯 Project Overview

**PupyTracker** is a React Native/Expo app for tracking puppy activities (walks, feeding, bathroom needs). It uses Supabase backend with authentication, real-time notifications, and analytics.

**Core Stack:**
- React Native (19.1.0) + Expo (~54.0.25)
- Supabase for auth & data
- Expo Notifications for push reminders
- React Navigation for screen management

## 🏗️ Architecture Patterns

### 1. **Authentication & Context Flow**
Located in `context/AuthContext.js`, this is the single source of truth for user state:
- `AuthProvider` wraps entire app in `App.js`
- Provides `useAuth()` hook with: `user`, `currentDog`, `signInWithEmail()`, `signUpWithEmail()`, `signOut()`
- Auto-loads current dog on auth state change via Supabase listener
- **Pattern:** All screens must call `const { currentDog, user } = useAuth()` to access auth state

### 2. **Component Reusability via Design System**
Reusable components are centralized and must have **PropTypes**:
- `components/FormInput.js` - Text inputs with label, optional secure/keyboard types
- `components/AuthButton.js` - Primary/secondary buttons for onboarding
- `components/OnboardingHeader.js` - Icon + title + subtitle header
- `components/BackButton.js` - Navigation back with consistent styling
- All exported via `components/index.js` for easy imports

**Critical:** New components must include PropTypes at bottom, never inline styling (use imported theme styles)

### 3. **Styling: Centralized Theme System**
Three-layer styling approach prevents duplication:

| Layer | File | Purpose |
|-------|------|---------|
| **Design Tokens** | `constants/theme.js` | Colors, spacing, typography, shadows |
| **Component Styles** | `styles/*.js` | Reusable style collections (homeStyles, onboardingStyles, etc.) |
| **Global Fallback** | `styles/global.js` | SafeArea, flex defaults |

**Pattern:** `import { homeStyles } from '../styles/homeStyles'` then use `style={homeStyles.container}`

### 4. **Data Fetching & Hooks**
Custom hooks in `hooks/` encapsulate business logic:
- `useHomeData(dogId, period)` - Fetches stats, outings, activities for given dog
- `useTimer(lastOuting)` - Returns formatted time-since string
- All use `supabase` directly via `config/supabase.js`

**Pattern:** Screens pull data via hooks, never hardcode Supabase queries in screens

### 5. **Screen Navigation Structure**
Auth & onboarding has dedicated flow (App.js lines ~50-100):
```
SplashScreen (2s) → AuthScreen (email/password) 
  → DogSetupScreen (puppy info) → HomeScreen (main app)
```

After auth, bottom-tab navigator with: Home, Walk, History, Analytics, Account

**Key:** Use `navigation.replace()` for one-way flows (don't stack auth screens), `navigation.navigate()` for tab switching

### 6. **Notification System (Complex - Read Before Modifying)**
Synchronous steps required:
1. User records walk in `WalkScreen.js` → saves `outings.datetime` to Supabase
2. Call `scheduleNotificationFromOuting(lastDateTime, dogName)` from `notificationService.js`
3. Service loads settings (presets + excluded time ranges), calculates next reminder time
4. Respects user's preferences (e.g., "don't remind 10pm-8am")
5. Uses `Notifications.scheduleNotificationAsync()` to schedule future push

**Critical bug to avoid:** NOT calling notification scheduler after recording an outing leaves reminders unscheduled. See `NOTIFICATION_ANALYSIS.md` for full flow.

## 📋 Developer Workflows

### Start Development
```bash
npm start                    # Local Expo server
npm run android             # Android emulator
npm run ios                 # iOS simulator
```

### Run Tests
```bash
npm test -- notificationService.test.js    # Unit tests for notification logic
```

### Build for EAS
```bash
eas build --platform ios
eas build --platform android
```

## ⚡ Project-Specific Conventions

### 1. **Constants & Emojis**
All dog-related strings use emoji + text for consistency:
```js
import { EMOJI } from '../constants/config';
// EMOJI.walk, EMOJI.dog, EMOJI.gear, EMOJI.analytics
```

### 2. **Personalized Messages**
`constants/dogMessages.js` generates gender-aware messages:
```js
const messages = getDogMessages(currentDog?.name, currentDog?.sex);
// Returns: messages.pronoun, messages.ateFood, messages.drankWater, etc.
```

### 3. **Async Storage**
Used for local notification settings (not auth tokens):
```js
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
```

### 4. **Error Handling Pattern**
Screens use `Alert.alert()` for user-facing errors:
```js
try { /* operation */ }
catch(err) { Alert.alert('❌ Error', err.message); }
finally { setLoading(false); }
```

### 5. **Refactoring History**
Major refactorings completed (see markdown docs):
- `ONBOARDING_REFACTORING.md` - Auth/DogSetup screens reduced 60-80% via component extraction
- `REFACTORING_NOTES.md` - HomeScreen now uses `useHomeData` hook
- `NOTIFICATION_ANALYSIS.md` - Complete notification system validation

**When modifying these areas, follow the NEW patterns in refactored components, not old_code.txt**

## 🔗 Key Files Reference

| File | Purpose |
|------|---------|
| `App.js` | Navigation setup, auth state bridging, notification init |
| `context/AuthContext.js` | User/dog state, auth methods, Supabase session listener |
| `components/screens/HomeScreen.js` | Main app view with timers, stats, action buttons |
| `components/screens/WalkScreen.js` | Record walk → Supabase + schedule notification |
| `components/services/notificationService.js` | Notification scheduling logic with settings/exclusions |
| `config/supabase.js` | Supabase client initialization (keys stored here) |
| `constants/theme.js` | Design tokens (colors, spacing, typography) |
| `components/index.js` | Barrel export for reusable components |

## ⚠️ Common Gotchas

1. **Using old_code.txt:** Out of date, reference refactored components instead
2. **Missing PropTypes:** All reusable components must have PropTypes defined
3. **Inline styles:** Never use `{ color: 'red' }` inline; use imported theme styles
4. **Auth state undefined:** Don't render screens until `useAuth().loading === false`
5. **Notification not triggering:** Must call scheduler AFTER Supabase insert completes; add 500ms delay if needed
6. **Styles not imported:** Every screen must import `GlobalStyles`, `screenStyles`, and component-specific styles

## 🚀 Quick Reference: Adding a New Screen

1. Create file in `components/screens/YourScreen.js`
2. Import: `useAuth`, `useNavigation`, `screenStyles`, `GlobalStyles`, `colors` from theme
3. Get current dog: `const { currentDog } = useAuth()`
4. Style container: `<View style={GlobalStyles.safeArea}><ScrollView>...</ScrollView></View>`
5. Add PropTypes if it accepts props
6. Register in `App.js` navigator
7. Use `navigation.navigate('YourScreen')` to link from other screens

## 📚 Documentation Files
- `ONBOARDING_SUMMARY.md` - Component architecture overview
- `NOTIFICATION_ANALYSIS.md` - Notification system deep-dive with test validation
- `REFACTORING_NOTES.md` - HomeScreen refactor details
