import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding6SituationScreen = ({ navigation, route }) => {
  const initial = route?.params?.userData || {};
  const dogData = route?.params?.dogData || {};
  const [selected, setSelected] = useState(initial.situation || null);

  const options = [
    { id: 'alone', label: 'Seul' },
    { id: 'couple', label: 'En couple' },
    { id: 'family', label: 'En famille' },
    { id: 'other', label: 'Autre' },
  ];

  const submit = () => {
    if (!selected) return;
    const userData = { ...initial, situation: selected };
    navigation.navigate('Onboarding7', { userData, dogData });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={88} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>Ta</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg }}>situation</Text>

        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: spacing.xxxl, lineHeight: 24 }}>Dans quel contexte élèves-tu ton chien ?</Text>

        <View style={{ gap: spacing.md, marginBottom: spacing.xxxl }}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setSelected(opt.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.lg,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selected === opt.id ? colors.primary : colors.gray200,
                backgroundColor: selected === opt.id ? '#f0f4ff' : colors.gray100,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: selected === opt.id ? '600' : '500', color: selected === opt.id ? colors.primary : colors.textPrimary, flex: 1 }}>{opt.label}</Text>
              {selected === opt.id && (
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <TouchableOpacity onPress={submit} disabled={!selected} style={{ paddingVertical: spacing.md, borderRadius: 10, backgroundColor: selected ? colors.primary : '#d0d0d0', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{selected ? 'Continuer' : 'Sélectionner pour continuer'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

Onboarding6SituationScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.shape({ params: PropTypes.object }),
};

export default Onboarding6SituationScreen;