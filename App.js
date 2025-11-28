import React, { useEffect, useRef } from 'react';
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
  const { loading, user, currentDog } = useAuth();

  if (loading || currentDog === undefined) {
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
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Walk" component={WalkScreen} />
            <Stack.Screen name="WalkHistory" component={WalkHistoryScreen} />
            <Stack.Screen name="DogProfile" component={DogProfileScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
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