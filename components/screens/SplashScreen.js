import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { onboardingStyles } from '../../styles/onboardingStyles';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={onboardingStyles.splashContainer}>
      <Text style={onboardingStyles.splashIcon}>🐕</Text>
      <Text style={onboardingStyles.splashTitle}>PuppyTracker</Text>
      <Text style={onboardingStyles.splashSubtitle}>Suivez la propreté de votre chiot</Text>
    </View>
  );
}

SplashScreen.propTypes = {
  onFinish: PropTypes.func.isRequired,
};