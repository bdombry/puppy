import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding6AgeScreen = ({ navigation, route }) => {
  const initial = route?.params?.userData || {};
  const [selected, setSelected] = useState(initial.ageRange || null);

  const options = [
    { id: '18-24', label: '18–24' },
    { id: '25-34', label: '25–34' },
    { id: '35-44', label: '35–44' },
    { id: '55-64', label: '55–64' },
    { id: '65+', label: '65+' },
  ];

  const submit = () => {
    if (!selected) return;
    const userData = { ...initial, ageRange: selected };
    navigation.navigate('Onboarding6Situation', { userData });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={84} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>Ta</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg }}>tranche d'âge</Text>

        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: spacing.xxxl, lineHeight: 24 }}>Pour adapter les suggestions et repères.</Text>

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

Onboarding6AgeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default Onboarding6AgeScreen;
