import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding6NameScreen = ({ navigation, route }) => {
  const initial = route?.params?.userData || {};
  const dogData = route?.params?.dogData || {};
  const [name, setName] = useState(initial.name || '');

  const handleContinue = () => {
    const userData = { ...initial, name };
    navigation.navigate('Onboarding6Gender', { userData, dogData });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={76} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: spacing.lg }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: colors.primary,
            marginBottom: spacing.xl,
            lineHeight: 35,
            textAlign: 'center',
          }}>
            Comment tu t'appelles ?
          </Text>

          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
            lineHeight: 20,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            Donne-nous ton prénom pour personnaliser l'expérience.
          </Text>

          <View style={{ paddingTop: spacing.lg }}>
            <View style={{ backgroundColor: colors.gray100, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.gray200 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Prénom"
                style={{
                  fontSize: 16,
                  padding: 0,
                }}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>
        </View>

        <View style={{ paddingVertical: spacing.lg }}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!name}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 14,
              backgroundColor: name ? colors.primary : '#d0d0d0',
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
              Continuer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

Onboarding6NameScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default Onboarding6NameScreen;
