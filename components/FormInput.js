import React from 'react';
import { View, Text, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { onboardingStyles } from '../styles/onboardingStyles';
import { colors } from '../constants/theme';

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable,
}) {
  return (
    <View style={onboardingStyles.formGroup}>
      {label && <Text style={onboardingStyles.label}>{label}</Text>}
      <TextInput
        style={onboardingStyles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  );
}

FormInput.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.string,
  editable: PropTypes.bool,
};

FormInput.defaultProps = {
  label: null,
  placeholder: '',
  secureTextEntry: false,
  keyboardType: 'default',
  autoCapitalize: 'sentences',
  editable: true,
};
