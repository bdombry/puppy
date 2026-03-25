import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Linking, AppState, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Purge du cache et de la session Supabase si la version change
const APP_VERSION = '1.2.0'; // À incrémenter à chaque release majeure

const purgeCacheIfNeeded = async () => {
  try {
    const storedVersion = await AsyncStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      // Purge des clés locales (onboarding, paywall, chien sélectionné)
      await AsyncStorage.removeItem('onboardingCompleted');
      await AsyncStorage.removeItem('show_paywall_on_login');
      await AsyncStorage.removeItem('@last_selected_dog');
      // Ne supprime PAS la session Supabase
      await AsyncStorage.setItem('app_version', APP_VERSION);
      console.log('🧹 Purge du cache local (nouvelle version, session conservée)');
    }
  } catch (e) {
    console.error('Erreur purge cache/version:', e);
  }
};
// Appel de la purge au tout début du composant principal
purgeCacheIfNeeded();
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { parseDeepLink, handleDeepLink } from './services/deeplinkService';
import { colors } from './constants/theme';
import SplashScreen from './components/screens/SplashScreen';
import AuthScreen from './components/screens/AuthScreen';
// Suppression des imports obsolètes : DogSetupScreen, DogRaceScreen, DogBirthdateScreen, DogPhotoScreen
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
// import useHasEverPaid from './hooks/useHasEverPaid';

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
  const { loading, user, currentDog, dogsLoading } = useAuth();
  const { premiumLoading, isPremium, hasMadeTransaction } = useUser();
  // On ne dépend plus de isPremium/hasMadeTransaction pour le paywall
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallDismissed, setPaywallDismissed] = useState(false);
  const navigationRef = useRef();

  // On ne vérifie plus l'historique de paiement ici

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

  // Nouvelle logique : afficher le paywall uniquement à la fin de l'onboarding (jamais à la connexion)
  // Afficher le paywall uniquement à la toute première complétion de l'onboarding (pas à la connexion)
  const prevOnboardingCompleted = useRef(false);
  useEffect(() => {
    // On détecte la transition false -> true
    if (
      user &&
      onboardingCompleted &&
      !prevOnboardingCompleted.current &&
      !paywallDismissed &&
      !isPremium &&
      !hasMadeTransaction // Ajout : ne pas afficher le paywall si déjà transaction
    ) {
      setShowPaywall(true);
      setPaywallDismissed(false);
      AsyncStorage.setItem('onboardingCompleted', 'true');
      console.log('🎯 Affichage du paywall (fin onboarding)');
    } else {
      setShowPaywall(false);
    }
    prevOnboardingCompleted.current = onboardingCompleted;
  }, [user, onboardingCompleted, paywallDismissed, isPremium, hasMadeTransaction]);

  // ── Auto-dismiss paywall si besoin (ex: bouton, ou paiement local) ──
  // (plus de logique automatique ici)

  // Initialiser les notifications quand on a un chien
  useEffect(() => {
    if (currentDog && currentDog.name) {
      console.log('📱 Initialisation des notifications pour:', currentDog.name);
      initializeNotifications().catch(error => {
        console.error('⚠️ Erreur initialisation notifications:', error);
      });
    }
  }, [currentDog]);

  // Attendre auth + onboarding check + dog loading + RevenueCat avant de render la navigation
  // Sécurité : timeout pour éviter un chargement infini si le chien n'arrive jamais
  const [dogWaitTimedOut, setDogWaitTimedOut] = useState(false);
  const [premiumTimedOut, setPremiumTimedOut] = useState(false);

  useEffect(() => {
    if (user && !currentDog && !dogsLoading && !loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout: chien non trouvé après 10s');
        setDogWaitTimedOut(true);
      }, 10000);
      return () => clearTimeout(timeout);
    } else {
      setDogWaitTimedOut(false);
    }
  }, [user, currentDog, dogsLoading, loading]);

  // ✅ Safety timeout pour premiumLoading: ne jamais bloquer plus de 8s
  useEffect(() => {
    if (user && premiumLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Premium loading timeout: forcing through after 8s');
        setPremiumTimedOut(true);
      }, 8000);
      return () => clearTimeout(timeout);
    } else {
      setPremiumTimedOut(false);
    }
  }, [user, premiumLoading]);

  // Debug logging pour comprendre l'état de chargement
  useEffect(() => {
    console.log('📊 Loading state:', {
      loading, checkingOnboarding, dogsLoading,
      premiumLoading, premiumTimedOut,
      user: !!user, currentDog: !!currentDog,
      dogWaitTimedOut, onboardingCompleted, showPaywall, paywallDismissed
    });
  }, [loading, checkingOnboarding, dogsLoading, premiumLoading, premiumTimedOut, user, currentDog, dogWaitTimedOut, onboardingCompleted, showPaywall, paywallDismissed]);

  if (loading || checkingOnboarding || dogsLoading || (user && premiumLoading && !premiumTimedOut) || (user && !currentDog && !dogWaitTimedOut)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.pupyBackground }}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>🐕 Chargement...</Text>
        <ActivityIndicator size="large" color={colors.primary} />
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
            <Stack.Screen name="Onboarding1" component={Onboarding1Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding1_5" component={Onboarding1_5Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding2" component={Onboarding2Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding3" component={Onboarding3Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding4" component={Onboarding4Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding5" component={Onboarding5Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding6" component={Onboarding6Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding6Name" component={Onboarding6NameScreen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding6Gender" component={Onboarding6GenderScreen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding6Age" component={Onboarding6AgeScreen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding6Situation" component={Onboarding6SituationScreen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding7" component={Onboarding7Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding8" component={Onboarding8Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="Onboarding9" component={Onboarding9Screen} options={{ animationEnabled: true }} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ animationEnabled: true }} />
            <Stack.Screen name="AccessCode" component={AccessCodeScreen} options={{ animationEnabled: true }} />
          </Stack.Group>
        ) : null}

        {/* 3. PAYWALL REVENUECAT - Affiché uniquement à la fin de l'onboarding */}
        {isAuthenticated && showPaywall && !paywallDismissed ? (
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

        {/* 5. MAIN APP - Authentifié + a un chien + premium */}
        {isAuthenticated && hasCurrentDog && isPremium ? (
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

        {/* 5b. Fallback supprimé : plus de mini-onboarding chien */}

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

// Error Boundary pour attraper les crash React et éviter fermeture brutale
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 App crash attrapé:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontSize: 50, marginBottom: 20 }}>😵</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 10 }}>
            Oups, une erreur est survenue
          </Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 10 }}>
            {this.state.error?.message || 'Erreur inconnue'}
          </Text>
          <Text style={{ fontSize: 11, textAlign: 'left', color: '#999', marginBottom: 20, maxHeight: 200 }} numberOfLines={15}>
            {this.state.error?.stack || ''}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{ backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <AppNavigator />
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}