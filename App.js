import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Linking, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { parseDeepLink, handleDeepLink } from './services/deeplinkService';
import SplashScreen from './components/screens/SplashScreen';
import AuthScreen from './components/screens/AuthScreen';
import DogSetupScreen from './components/screens/DogSetupScreen';
import DogRaceScreen from './components/screens/DogRaceScreen';
import DogBirthdateScreen from './components/screens/DogBirthdateScreen';
import DogPhotoScreen from './components/screens/DogPhotoScreen';
import AddDogScreen from './components/screens/AddDogScreen';
import HomeScreen from './components/screens/HomeScreen';
import WalkScreen from './components/screens/WalkScreen';
import WalkHistoryScreen from './components/screens/WalkHistoryScreen'; 
import EditIncidentScreen from './components/screens/EditIncidentScreen';
import EditSuccessScreen from './components/screens/EditSuccessScreen';
import EditActivityScreen from './components/screens/EditActivityScreen';
import DogProfileScreen from './components/screens/DogProfileScreen';
import AnalyticsScreen from './components/screens/AnalyticsScreen';
import AccountScreen from './components/screens/AccountScreen';
import MapScreen from './components/screens/MapScreen';
import { NotificationSettingsScreen } from './components/screens/NotificationSettingsScreen';
import FeedingScreen from './components/screens/FeedingScreen';
import ActivityScreen from './components/screens/ActivityScreen';
import AcceptInvitationScreen from './components/screens/AcceptInvitationScreen';
import AccessCodeScreen from './components/screens/AccessCodeScreen';
import Onboarding1Screen from './components/screens/Onboarding1Screen';
import Onboarding1_5Screen from './components/screens/Onboarding1_5Screen';
import Onboarding2Screen from './components/screens/Onboarding2Screen';
import Onboarding3Screen from './components/screens/Onboarding3Screen';
import Onboarding4Screen from './components/screens/Onboarding4Screen';
import Onboarding5Screen from './components/screens/Onboarding5Screen';
import Onboarding7Screen from './components/screens/Onboarding7Screen';
import Onboarding8Screen from './components/screens/Onboarding8Screen';
import Onboarding9Screen from './components/screens/Onboarding9Screen';
import Onboarding6Screen from './components/screens/Onboarding6Screen';
import Onboarding6NameScreen from './components/screens/Onboarding6NameScreen';
import Onboarding6GenderScreen from './components/screens/Onboarding6GenderScreen';
import Onboarding6AgeScreen from './components/screens/Onboarding6AgeScreen';
import Onboarding6SituationScreen from './components/screens/Onboarding6SituationScreen';
import CreateAccountScreen from './components/screens/CreateAccountScreen';
import RevenueCatPaywallScreen from './components/screens/RevenueCatPaywallScreen';
import { Footer } from './components/Footer';
import { initializeNotifications } from './components/services/notificationService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Deep linking configuration
const prefix = 'pupytracker://';
const linking = {
  prefixes: [prefix, 'https://pupytracker.app/'],
  config: {
    screens: {
      AcceptInvitation: 'invite/:token',
      MainTabs: '',
      Auth: 'auth',
      DogSetup: 'setup',
      RevenueCatPaywall: 'paywall',
      CreateAccount: 'create-account',
    },
  },
};

// Navigation avec Tab (Accueil + 4 écrans autour)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <Footer {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="DogProfile" 
        component={DogProfileScreen}
        options={{ title: 'Profil' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Map' }}
      />
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="WalkHistory" 
        component={WalkHistoryScreen}
        options={{ title: 'Historique' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Stats' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { loading, user, currentDog } = useAuth();
  const { isPremium, premiumLoading, revenueCatReady, paywallShownThisSession } = useUser();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallDismissed, setPaywallDismissed] = useState(false);
  const navigationRef = useRef();

  // ── Callback stable pour le paywall (évite remount du composant) ──
  const handlePaywallDismissed = useCallback(() => {
    console.log('✅ Paywall dismissed - navigating to MainTabs');
    setPaywallDismissed(true);
    setOnboardingCompleted(true);
    AsyncStorage.setItem('show_paywall_on_login', 'false');
    AsyncStorage.setItem('onboardingCompleted', 'true');
  }, []);

  // Gérer les deeplinks
  useEffect(() => {
    const handleDeepLinkURL = ({ url }) => {
      if (!url) return;
      
      console.log('🔗 Deep link reçu:', url);
      
      // Parser et gérer le deeplink
      const deeplink = parseDeepLink(url);
      if (deeplink) {
        handleDeepLink(navigationRef, deeplink);
      }
    };

    // Écouter les deeplinks quand l'app est actif
    const subscription = Linking.addEventListener('url', handleDeepLinkURL);

    // Vérifier les deeplinks au démarrage
    Linking.getInitialURL().then((url) => {
      if (url != null) {
        handleDeepLinkURL({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Vérifier si l'onboarding a été complété
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // ⚠️ DEV: Flag pour tester le flow d'onboarding
        // await AsyncStorage.removeItem('onboardingCompleted');
        
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        setOnboardingCompleted(completed === 'true');
      } catch (error) {
        console.error('Erreur lors de la vérification du onboarding:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // ✅ Écouter les changements d'onboarding en temps réel
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        // App revient au focus - re-vérifier le flag
        try {
          const completed = await AsyncStorage.getItem('onboardingCompleted');
          setOnboardingCompleted(completed === 'true');
          console.log('🔄 Onboarding flag re-vérifié:', completed === 'true');
        } catch (error) {
          console.error('Erreur vérification onboarding:', error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Afficher le paywall seulement si non-premium
  useEffect(() => {
    const checkPaywall = async () => {
      if (user) {
        // ── Transition onboarding → paywall ──
        // Si user est authentifié mais onboarding pas terminé côté React state,
        // c'est forcément un nouvel utilisateur qui vient de créer son compte
        // pendant l'onboarding. On montre le paywall directement.
        // (On ne lit PAS show_paywall_on_login car il y a une race condition :
        //  le flag est set APRÈS signUp, mais le auth state change se déclenche
        //  PENDANT signUp, donc le flag n'existe pas encore à ce moment.)
        if (!onboardingCompleted) {
          // Marquer l'onboarding terminé (state + AsyncStorage)
          await AsyncStorage.setItem('onboardingCompleted', 'true');
          setOnboardingCompleted(true);

          if (!isPremium) {
            console.log('🎯 Post-onboarding: activation du paywall (nouvel utilisateur)');
            setShowPaywall(true);
            setPaywallDismissed(false);
          }
          return;
        }

        // Si l'utilisateur est déjà premium, pas de paywall
        if (isPremium) {
          setShowPaywall(false);
          AsyncStorage.setItem('show_paywall_on_login', 'false');
          return;
        }

        // Reconnexion d'un utilisateur existant : vérifier le flag
        const shouldShowPaywall = await AsyncStorage.getItem('show_paywall_on_login');
        if (shouldShowPaywall === 'true' && !paywallShownThisSession) {
          setShowPaywall(true);
          setPaywallDismissed(false);
        } else {
          setShowPaywall(false);
        }
      } else {
        setShowPaywall(false);
        setPaywallDismissed(false);
      }
    };

    checkPaywall();
  }, [user, onboardingCompleted, isPremium, paywallShownThisSession]);

  // ── Auto-dismiss paywall quand premium confirmé (réactif, pas besoin de callback) ──
  useEffect(() => {
    if (showPaywall && !paywallDismissed && isPremium) {
      console.log('✅ Premium détecté dans App.js → auto-dismiss du paywall');
      setPaywallDismissed(true);
      setOnboardingCompleted(true);
      AsyncStorage.setItem('show_paywall_on_login', 'false');
      AsyncStorage.setItem('onboardingCompleted', 'true');
    }
  }, [showPaywall, paywallDismissed, isPremium]);

  // Initialiser les notifications quand on a un chien
  useEffect(() => {
    if (currentDog && currentDog.name) {
      console.log('📱 Initialisation des notifications pour:', currentDog.name);
      initializeNotifications().catch(error => {
        console.error('⚠️ Erreur initialisation notifications:', error);
      });
    }
  }, [currentDog]);

  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>🐕 Chargement...</Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isAuthenticated = user;
  const hasCurrentDog = currentDog && currentDog.id;

  return (
    <NavigationContainer ref={navigationRef} linking={linking} fallback={<ActivityIndicator size="large" />}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {/* 1. ONBOARDING - Nouveau compte, pas encore de profil */}
        {!onboardingCompleted && !isAuthenticated ? (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen 
              name="Onboarding1" 
              component={Onboarding1Screen}
            />
            <Stack.Screen 
              name="Onboarding1_5" 
              component={Onboarding1_5Screen}
            />
            <Stack.Screen 
              name="Onboarding2" 
              component={Onboarding2Screen}
            />
            <Stack.Screen 
              name="Onboarding3" 
              component={Onboarding3Screen}
            />
            <Stack.Screen 
              name="Onboarding4" 
              component={Onboarding4Screen}
            />
            <Stack.Screen 
              name="Onboarding5" 
              component={Onboarding5Screen}
            />
            <Stack.Screen 
              name="Onboarding6" 
              component={Onboarding6Screen}
            />
            <Stack.Screen name="Onboarding6Name" component={Onboarding6NameScreen} />
            <Stack.Screen name="Onboarding6Gender" component={Onboarding6GenderScreen} />
            <Stack.Screen name="Onboarding6Age" component={Onboarding6AgeScreen} />
            <Stack.Screen name="Onboarding6Situation" component={Onboarding6SituationScreen} />
            <Stack.Screen 
              name="Onboarding7" 
              component={Onboarding7Screen}
            />
            <Stack.Screen 
              name="Onboarding8" 
              component={Onboarding8Screen}
            />
            <Stack.Screen 
              name="Onboarding9" 
              component={Onboarding9Screen}
            />
            <Stack.Screen 
              name="CreateAccount" 
              component={CreateAccountScreen}
            />
            <Stack.Screen name="AccessCode" component={AccessCodeScreen} />
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{ animationEnabled: false }}
            />
          </Stack.Group>
        ) : null}

        {/* 2. AUTH SCREEN - Onboarding complété, mais pas de compte créé ou pas connecté */}
        {onboardingCompleted && !isAuthenticated ? (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{ animationEnabled: false }}
            />
            <Stack.Screen 
              name="AcceptInvitation" 
              component={AcceptInvitationScreen}
              options={{ animationEnabled: true }}
            />
          </Stack.Group>
        ) : null}

        {/* 3. PAYWALL REVENUECAT - Authentifié avec chien + paywall à afficher */}
        {isAuthenticated && hasCurrentDog && showPaywall && !paywallDismissed ? (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen name="RevenueCatPaywall">
              {(props) => (
                <RevenueCatPaywallScreen 
                  {...props} 
                  onPaywallDismissed={handlePaywallDismissed}
                />
              )}
            </Stack.Screen>
          </Stack.Group>
        ) : null}

        {/* 5. MAIN APP - Authentifié + a un chien */}
        {isAuthenticated && hasCurrentDog ? (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="AddDog" component={AddDogScreen} />
            <Stack.Screen name="Walk" component={WalkScreen} />
            <Stack.Screen name="Feeding" component={FeedingScreen} />
            <Stack.Screen name="Activity" component={ActivityScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="EditIncident" component={EditIncidentScreen} />
            <Stack.Screen name="EditSuccess" component={EditSuccessScreen} />
            <Stack.Screen name="EditActivity" component={EditActivityScreen} />
            <Stack.Screen 
              name="AcceptInvitation" 
              component={AcceptInvitationScreen}
              options={{ animationEnabled: true }}
            />
            <Stack.Screen 
              name="NotificationSettings" 
              options={{ headerShown: false }}
            >
              {({ navigation }) => (
                <NotificationSettingsScreen 
                  dogName={currentDog?.name || 'ton chiot'}
                  onGoBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </Stack.Group>
        ) : null}

        {/* 6. MODAL GLOBAL - Paywall accessible depuis n'importe quel état via deeplink */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen 
            name="RevenueCatPaywallModal" 
            component={RevenueCatPaywallScreen}
            options={{ headerShown: false, animationEnabled: true }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </AuthProvider>
  );
}