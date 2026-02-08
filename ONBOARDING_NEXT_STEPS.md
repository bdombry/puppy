# 🚀 Next Steps – Onboarding Implementation Roadmap

## 📋 Priorités Immédiates

### 1. **Tester l'Onboarding** (URGENT)
**Effort**: 2-4 heures  
**Responsable**: Dev/QA

```bash
# Commandes pour tester:
npm start
# Vider AsyncStorage pour revoir l'onboarding:
# Dans Redux DevTools ou Debugger:
await AsyncStorage.removeItem('onboardingCompleted');
```

**Checklist**:
- [ ] Tous les écrans s'affichent correctement
- [ ] Navigation fluide (swipe/next buttons)
- [ ] Progress bar remplit correctement
- [ ] Pas d'erreur console
- [ ] Responsive sur iPhone 12, 13, 14
- [ ] Responsive sur Android (Pixel 5, 6)
- [ ] Colors correspondent au spec (#6FAF98, #F4F1EC, #A8C7D8, #2E2E2E, #7A7A7A, #D6B26E)

---

### 2. **Implémenter Social Auth** (Onboarding5)
**Effort**: 4-6 heures  
**Responsable**: Backend + Frontend

**À faire**:
```javascript
// Onboarding5Screen.js - Décommenter et implémenter:

// Apple Sign-In
import * as AppleAuthentication from 'expo-apple-authentication';

const handleAppleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    // Envoyer credential à Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
  } catch (error) {
    // Handle error
  }
};

// Google Sign-In
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    // Envoyer userInfo à Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken,
    });
  } catch (error) {
    // Handle error
  }
};
```

**Dépendances à ajouter**:
```bash
npm install expo-apple-authentication @react-native-google-signin/google-signin
```

---

### 3. **Intégrer Premium / IAP** (Onboarding6)
**Effort**: 6-8 heures  
**Responsable**: Backend + Frontend

**Option A: RevenueCat** (Recommandé)
```bash
npm install react-native-purchases
```

```javascript
// Onboarding6Screen.js - Intégration premium
import Purchases from 'react-native-purchases';

useEffect(() => {
  Purchases.configure({
    apiKey: 'YOUR_RC_API_KEY',
  });
  loadOfferings();
}, []);

const loadOfferings = async () => {
  const offerings = await Purchases.getOfferings();
  // Afficher les offerings
};

const handlePremiumPurchase = async () => {
  try {
    const { purchaserInfo } = await Purchases.purchasePackage(package);
    // Check entitlements
  } catch (error) {
    // Handle error
  }
};
```

**Option B: Expo IAP**
```bash
npm install react-native-iap
```

---

### 4. **Créer les Illustrations/Mascotte** (Optionnel mais important)
**Effort**: 4-8 heures (ou 500€ designer)  
**Responsable**: Designer

**Actuel**: Emojis (🐕, 😊, 👍, 👋, etc.)  
**À faire**: Illustrations custom PNG ou SVG

**Poses requises**:
1. **Écran 1**: Chien dubitative (point d'interrogation sur la tête)
2. **Écran 2**: Chien énergique (montrant des options)
3. **Écran 3**: Chien serein/heureux
4. **Écran 4**: Chien thumbs up
5. **Écran 5**: Chien welcome/accueillant
6. **Écran 6**: Chien célébrant (sparkles autour)

**Format recommandé**:
- PNG avec transparence (200x200px @ 3x density)
- Ou SVG (scalable, léger)
- Consistent style (même couleur palette)

---

### 5. **Ajouter Analytics Tracking**
**Effort**: 2-3 heures  
**Responsable**: Frontend

```javascript
// À ajouter dans chaque écran:

import { analytics } from '../../config/analytics'; // ou Segment, Mixpanel, etc.

useEffect(() => {
  analytics.track('Onboarding_Screen_1_Viewed');
}, []);

// Events à tracker:
- Onboarding_Screen_X_Viewed
- Onboarding_Skip_Clicked (with screen number)
- Onboarding_NextButton_Clicked
- Onboarding_Signup_Started
- Onboarding_Signup_Completed
- Onboarding_Premium_Presented
- Onboarding_Premium_Trial_Started
```

---

### 6. **Optimisations & Polish** (Optionnel)
**Effort**: 2-4 heures  
**Responsable**: Frontend

```javascript
// À ajouter pour plus de punch:

// 1. Animations d'écrans (fade-in, slide)
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// 2. Lottie animations pour mascotte
import LottieView from 'lottie-react-native';

// 3. Haptic feedback sur buttons
import * as Haptics from 'expo-haptics';
const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // ... action
};

// 4. A/B testing endpoints
const isVariantA = await AsyncStorage.getItem('abTest_variant');
```

---

## 📊 Timeline Recommended

```
Week 1:
  ├─ Day 1-2: Test onboarding (2h + bug fixes)
  ├─ Day 3-4: Implement social auth (4h)
  └─ Day 5: Polish & Android testing (2h)

Week 2:
  ├─ Day 1-2: IAP/Premium integration (6h)
  ├─ Day 3: Create/get illustrations (4h)
  └─ Day 4-5: Analytics + Polish (3h)

Week 3:
  ├─ Full QA & testing
  └─ App Store/Play Store submission prep
```

---

## 🎯 Success Criteria

**Launch Ready When**:
- ✅ Zero console errors
- ✅ 100% responsive (iPhone + Android)
- ✅ Navigation flow complete
- ✅ Social auth works
- ✅ Premium paywall integrated
- ✅ Analytics tracking live
- ✅ Team satisfied with UX/UI
- ✅ Store guidelines compliance checked

---

## 🔧 Known Limitations (à adresser)

| Issue | Impact | Workaround | Priority |
|-------|--------|-----------|----------|
| Social auth buttons not functional | Users can't use Apple/Google | Email signup only for now | P1 |
| Premium flow incomplete | Can't test full paywall | Manual Supabase subscription insert | P2 |
| Illustrations are emojis | Looks less professional | Use custom illustrations later | P3 |
| No animations | Feels static | Add Reanimated later | P3 |
| No A/B testing | Can't optimize | Add with analytics later | P4 |

---

## 📝 Configuration Files to Check

### Supabase Setup
```javascript
// config/supabase.js - Verify:
- Email/password auth enabled
- OAuth providers configured (Apple, Google)
- Sign-up policies correct
- Email confirmation required?
```

### App Store Submission
```
- Privacy policy URL ready
- Terms of service URL ready
- Screenshots (at least one per screen)
- App description mentions onboarding
```

### Google Play Setup
```
- Store listing draft created
- Permissions reviewed
- Pricing tier set (4.99€/month)
```

---

## 🐛 Bug Tracking Template

```
Title: [Onboarding] [ScreenX] [Issue]

Environment:
- Device: iPhone 12 / Pixel 5
- OS: iOS 16 / Android 12
- App version: 1.0.0

Description:
[What's broken]

Steps to Reproduce:
1. Launch app
2. [Action]
3. [Issue occurs]

Expected:
[What should happen]

Actual:
[What happens instead]

Screenshots:
[Attach]

Priority:
- P0: Blocker (can't launch)
- P1: High (core feature broken)
- P2: Medium (affects some users)
- P3: Low (cosmetic/minor)
```

---

## 🚀 Post-Launch Improvements

**Phase 2** (après launch):
- [ ] A/B test different messaging
- [ ] Implement onboarding analytics dashboard
- [ ] Create onboarding tutorial video
- [ ] Add contextual help/tooltips
- [ ] Implement retention tracking
- [ ] Optimize conversion rate

---

## 📞 Support & Escalation

**Questions about**:
- **UX/Design**: Review `ONBOARDING_VISUAL_GUIDE.md`
- **Code Structure**: Review `ONBOARDING_IMPLEMENTATION.md`
- **Testing**: Review `ONBOARDING_TEST_CHECKLIST.md`
- **Colors/Theme**: Check `constants/theme.js`

**Escalation**:
- Color mismatch → Designer review
- Navigation broken → Frontend dev
- Auth not working → Backend + Supabase
- IAP issues → RevenueCat/Google Play support

---

## ✅ Final Checklist Before Launch

- [ ] All screens tested on iOS + Android
- [ ] Social auth fully functional
- [ ] Premium paywall integrated
- [ ] Analytics tracking live
- [ ] App Store screenshots ready
- [ ] Privacy policy + ToS approved
- [ ] Illustrations/mascotte final
- [ ] Progress bar animating smoothly
- [ ] No console errors or warnings
- [ ] Performance optimized (< 3s per screen)
- [ ] Accessibility checked (A11y)
- [ ] Team sign-off on UX
- [ ] Store listing complete
- [ ] Launch date set

---

**Last Updated**: 21 Janvier 2026  
**Status**: ✅ Ready for Testing  
**Next Meeting**: TBD
