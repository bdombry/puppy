import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './components/screens/SplashScreen';
import AuthScreen from './components/screens/AuthScreen';
import DogSetupScreen from './components/screens/DogSetupScreen';
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
import { Footer } from './components/Footer';
import { initializeNotifications } from './components/services/notificationService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

  // Initialiser les notifications quand on a un chien
  useEffect(() => {
    if (currentDog && currentDog.name) {
      console.log('📱 Initialisation des notifications pour:', currentDog.name);
      initializeNotifications().catch(error => {
        console.error('⚠️ Erreur initialisation notifications:', error);
      });
    }
  }, [currentDog]);

  if (loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  const isAuthenticated = user;
  const hasCurrentDog = currentDog && currentDog.id;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ animationEnabled: false }}
          />
        ) : !hasCurrentDog ? (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen name="DogSetup" component={DogSetupScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Walk" component={WalkScreen} />
            <Stack.Screen name="Feeding" component={FeedingScreen} />
            <Stack.Screen name="Activity" component={ActivityScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="EditIncident" component={EditIncidentScreen} />
            <Stack.Screen name="EditSuccess" component={EditSuccessScreen} />
            <Stack.Screen name="EditActivity" component={EditActivityScreen} />
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
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}