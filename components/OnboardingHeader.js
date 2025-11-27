import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { onboardingStyles } from '../styles/onboardingStyles';

export default function OnboardingHeader({ icon, title, subtitle }) {
  return (
    <View style={onboardingStyles.headerContainer}>
      {icon && <Text style={onboardingStyles.icon}>{icon}</Text>}
      <Text style={onboardingStyles.title}>{title}</Text>
      {subtitle && <Text style={onboardingStyles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

OnboardingHeader.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

OnboardingHeader.defaultProps = {
  icon: null,
  subtitle: null,
};
