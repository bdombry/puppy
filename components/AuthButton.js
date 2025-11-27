import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { onboardingStyles } from '../styles/onboardingStyles';

export default function AuthButton({
  type,
  label,
  icon,
  onPress,
  loading,
  disabled,
}) {
  // Pour les boutons "link", on utilise directement le style linkButton
  if (type === 'link') {
    return (
      <TouchableOpacity
        style={onboardingStyles.linkButton}
        onPress={onPress}
        disabled={loading || disabled}
        activeOpacity={0.7}
      >
        <Text style={onboardingStyles.linkButtonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  const buttonStyle = [
    onboardingStyles.button,
    type === 'primary' && onboardingStyles.buttonPrimary,
    type === 'secondary' && onboardingStyles.buttonSecondary,
    type === 'outline' && onboardingStyles.buttonOutline,
    (loading || disabled) && onboardingStyles.buttonDisabled,
  ];

  const textStyle = [
    onboardingStyles.buttonText,
    (type === 'secondary' || type === 'outline') && onboardingStyles.buttonTextDark,
    type === 'outline' && onboardingStyles.buttonTextOutline,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {icon && <Text style={onboardingStyles.buttonIcon}>{icon}</Text>}
        <Text style={textStyle}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

AuthButton.propTypes = {
  type: PropTypes.oneOf(['primary', 'secondary', 'outline', 'link']).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

AuthButton.defaultProps = {
  icon: null,
  loading: false,
  disabled: false,
};
