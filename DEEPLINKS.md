# 🔗 Deeplinks Documentation - PupyTracker

## Overview

PupyTracker supports deep linking using the custom URI scheme `pupytracker://`. This allows you to:
- Open the app at specific screens from external sources
- Send marketing campaigns with direct links
- Support share/invite flows

## Supported Deeplinks

### 1. **Paywall**
Opens the subscription/paywall screen directly
```
pupytracker://paywall
https://pupytracker.app/paywall
```

**Use cases:**
- Marketing campaigns to drive subscriptions
- Post-signup upsell prompts
- Upgrade reminders in emails

### 2. **Accept Invitation**
Accept a collaboration invitation with a token
```
pupytracker://invite/:token
https://pupytracker.app/invite/abc123def456
```

**Use cases:**
- Email invitations to collaborators
- Shared links to add user to a dog profile

**Example:**
```
pupytracker://invite/sk_live_abc123token456
```

### 3. **Authentication**
Go directly to the login/signup screen
```
pupytracker://auth
https://pupytracker.app/auth
```

**Use cases:**
- Force logout and redirect to login
- Authentication deeplink for OAuth flows

### 4. **Dog Setup**
Go to the dog profile creation screen
```
pupytracker://setup
https://pupytracker.app/setup
```

**Use cases:**
- New user flows
- Adding additional dogs

## Testing Deeplinks

### On iOS (Simulator)
```bash
# Using xcrun
xcrun simctl openurl booted "pupytracker://paywall"

# Using Expo CLI
npx expo send "pupytracker://paywall"
```

### On Android (Emulator)
```bash
# Using adb
adb shell am start -W -a android.intent.action.VIEW -d "pupytracker://paywall"

# Using Expo CLI
npx expo send "pupytracker://paywall"
```

### In Development (Expo)
```bash
# Start the dev server
npm start

# In a terminal/browser console
# Use Linking.openURL() to test
```

### Manual Testing with Expo Go
1. In your browser console while in Expo Dev mode:
```javascript
import { Linking } from 'react-native';
Linking.openURL('pupytracker://paywall');
```

## Implementation Details

### Files Involved

1. **App.js**
   - Deep linking configuration in `linking` object
   - Navigation ref setup
   - Deep link listener setup

2. **services/deeplinkService.js**
   - `parseDeepLink()` - Parses URL to extract route and params
   - `handleDeepLink()` - Routes to appropriate screen
   - `generateDeepLink()` - Generates deeplink URLs programmatically

3. **app.json**
   - URI scheme configuration (`pupytracker`)
   - iOS and Android scheme setup

## Generating Deeplinks Programmatically

```javascript
import { generateDeepLink } from './services/deeplinkService';

// Generate paywall deeplink
const paywallLink = generateDeepLink('paywall');
// Returns: "pupytracker://paywall"

// Generate invite deeplink
const inviteLink = generateDeepLink('invite', { token: 'my_token' });
// Returns: "pupytracker://invite/my_token"
```

## Navigation Flow

When a deeplink is received:

1. **App starts with deeplink** → `Linking.getInitialURL()` captures it
2. **App already running** → `Linking.addEventListener('url')` captures it
3. **DeepLink parsed** → `parseDeepLink(url)` extracts route name and params
4. **Navigation triggered** → `handleDeepLink(navigationRef, deeplink)` navigates to screen

## Troubleshooting

### Deeplink not working on iOS
- Check `app.json` has `"scheme": "pupytracker"` under iOS config
- Rebuild native code: `eas build --platform ios`
- Clear app cache: `xcrun simctl erase all`

### Deeplink not working on Android
- Check `app.json` has `"scheme": "pupytracker"` under Android config
- Rebuild: `eas build --platform android` or `npm run android`
- Clear app data: `adb shell pm clear com.bendombry.pupytracker`

### Navigation not happening
- Check console logs for "Deep link reçu" message
- Verify the route name matches exactly (case-sensitive)
- Ensure the screen is registered in the navigator

## Best Practices

1. **Use `generateDeepLink()`** for creating links in your app
2. **Test with both URL schemes** (custom scheme and https)
3. **Add fallback behavior** for when deeplink navigation fails
4. **Log deeplinks** for analytics and debugging
5. **Keep routes simple** and meaningful

## Analytics Integration

To track deeplink usage, add logging in `deeplinkService.js`:

```javascript
export const handleDeepLink = (navigationRef, deeplink) => {
  // ... existing code ...
  
  // Send to analytics
  logEvent('deeplink_navigated', {
    route: deeplink.routeName,
    params: deeplink.params,
    timestamp: new Date().toISOString()
  });
};
```

## Future Enhancements

- [ ] Add more routes (e.g., specific dog, specific activity types)
- [ ] Add query parameter support (e.g., `?promo=summer20`)
- [ ] Implement deeplink analytics
- [ ] Add deeplink validation
- [ ] Support web version with https:// scheme
