import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import { onboardingStyles } from '../styles/onboardingStyles';

export default function BackButton({ onPress }) {
  return (
    <TouchableOpacity style={onboardingStyles.backButton} onPress={onPress}>
      <Text style={onboardingStyles.backButtonText}>← Retour</Text>
    </TouchableOpacity>
  );
}

BackButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};
