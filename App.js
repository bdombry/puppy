import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './components/screens/SplashScreen';
import AuthScreen from './components/screens/AuthScreen';
import DogSetupScreen from './components/screens/DogSetupScreen';
import HomeScreen from './components/screens/HomeScreen';
import WalkScreen from './components/screens/WalkScreen';
import WalkHistoryScreen from './components/screens/WalkHistoryScreen'; 
import DogProfileScreen from './components/screens/DogProfileScreen';
import AnalyticsScreen from './components/screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { loading, user, isGuestMode, currentDog } = useAuth();

  if (loading || currentDog === undefined) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user && !isGuestMode && (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}

        {((user || isGuestMode) && !currentDog) && (
          <Stack.Screen name="DogSetup" component={DogSetupScreen} />
        )}

        {((user || isGuestMode) && currentDog) && (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Walk" component={WalkScreen} />
            <Stack.Screen name="WalkHistory" component={WalkHistoryScreen} />
            <Stack.Screen name="DogProfile" component={DogProfileScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          </>
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