# Test Checklist - PupyTracker Onboarding

## 🧪 Tests à Effectuer

### Visual Tests
- [ ] Écran 1: Hook accroche bien, mascotte visible, CTA cliquable
- [ ] Écran 2: 4 cards affichées correctement, texte lisible
- [ ] Écran 3: Bénéfices listés, points alignés, mascotte visible
- [ ] Écran 4: Trust items affichés, quote lisible
- [ ] Écran 5: Inputs email/password visibles, social buttons affichés
- [ ] Écran 6: Pricing toggle fonctionne, plan card bien stylisée

### Navigation Tests
- [ ] Swipe/Next entre écrans 1→2→3→4→5→6
- [ ] Skip link visible jusqu'à écran 4 (pas après)
- [ ] Skip de l'écran 1 ou 2 → Écran 4 ✓
- [ ] CTA "Créer mon compte" (écran 4) → Écran 5 ✓
- [ ] CTA "Essai gratuit" (écran 6) → AuthScreen ✓
- [ ] CTA "Continuer sans premium" → AuthScreen ✓

### Fonctionnalité Tests
- [ ] Signup email/password fonctionne (Onboarding5)
- [ ] AsyncStorage.setItem('onboardingCompleted', 'true') après signup
- [ ] Relancer l'app → pas de onboarding (va directement à Auth si pas loggé)
- [ ] Toggle mensuel/annuel (écran 6) change le prix ✓
- [ ] Progress bar remplit correctement (16% → 33% → 50% → 66% → 83% → 100%)

### Styling Tests
- [ ] Couleurs correspondent au spec:
  - Primary: #6FAF98
  - Background: #F4F1EC
  - Accent: #A8C7D8
  - Text Primary: #2E2E2E
  - Text Secondary: #7A7A7A
  - Premium Accent: #D6B26E
- [ ] Spacing cohérent entre écrans
- [ ] Border radius doux et constant (lg, xl)
- [ ] Shadows subtiles mais présentes

### Safe Area Tests
- [ ] Pas de cutoff sur notch/rounded corners
- [ ] Boutons toujours cliquables (safe bottom inset respecté)
- [ ] Texte lisible sur iPhone 12, 13, 14 (portrait)
- [ ] Scrollable sur petit écran si besoin

### Content Tests
- [ ] Textes corrects (pas de placeholder {/* */})
- [ ] Pas de typo flagrantes
- [ ] Emojis affichent correctement (mascotte)
- [ ] Icons ✓ et ⭐ visibles

### Android Specific
- [ ] Back gesture fonctionne
- [ ] Navigation state cohérent
- [ ] TextInput focus/unfocus OK
- [ ] Keyboard overlapping handled

### iOS Specific
- [ ] Swipe back works (if enabled)
- [ ] Safe area inset correct
- [ ] TouchableOpacity feedback visible
- [ ] Status bar color OK

---

## 🚀 Test Command

```bash
# Nettoyer les caches
rm -rf node_modules
npm install

# Démarrer Expo
npm start

# Nettoyer AsyncStorage pour tester l'onboarding
# Dans le component ou depuis les Settings:
await AsyncStorage.removeItem('onboardingCompleted');

# Recharger l'app
```

---

## ⚠️ Choses à Vérifier Post-Implementation

1. **AuthContext**: Assurez-vous que les imports et la logique d'auth sont correctes
2. **Supabase**: Email/password signup doit être configuré dans Supabase auth
3. **AsyncStorage**: Vérifier que la clé 'onboardingCompleted' n'entre pas en conflit
4. **Navigation**: Flow onboarding → auth → dogsetup → main app est correct
5. **Social Auth**: Apple/Google buttons dans Onboarding5 ne sont pas implémentés (juste UI placeholder)

---

## 📊 Monitoring

À ajouter dans analytics:
```javascript
// Écran 1
analytics.track('Onboarding_Screen_1_Viewed');

// Écran 2
analytics.track('Onboarding_Screen_2_Viewed');
analytics.track('Onboarding_Feature_Cards_Seen');

// Écran 3
analytics.track('Onboarding_Screen_3_Viewed');

// Écran 4
analytics.track('Onboarding_Screen_4_Viewed');
analytics.track('Onboarding_Trust_Seen');

// Écran 5
analytics.track('Onboarding_Screen_5_Viewed');
analytics.track('Onboarding_Email_Signup_Started');

// Écran 6
analytics.track('Onboarding_Screen_6_Viewed');
analytics.track('Onboarding_Premium_Presented');

// Completions
analytics.track('Onboarding_Completed');
analytics.track('Onboarding_Skipped', { screen: 1 or 2 or 3 or 4 });
```

---

## 🎯 Success Criteria

✅ **Must Have**:
- [ ] Tous les écrans affichent correctement
- [ ] Navigation fluide entre écrans
- [ ] Progress bar s'affiche partout
- [ ] Signup fonctionne (écran 5)
- [ ] Onboarding marqué comme complété
- [ ] Pas d'erreur console

✅ **Should Have**:
- [ ] Animations douces (fade-in, transition)
- [ ] Mascotte cohérente (émojis pour now, illustrations later)
- [ ] Responsive sur tous les appareils

✅ **Nice to Have**:
- [ ] Analytics tracking
- [ ] A/B testing URLs
- [ ] Lottie animations pour mascotte
