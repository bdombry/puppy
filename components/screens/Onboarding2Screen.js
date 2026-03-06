import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import BackButton from '../BackButton';

const Onboarding2Screen = ({ navigation }) => {
  const [selectedProblems, setSelectedProblems] = useState([]);

  const problems = [
    { id: 'forget', label: "J'oublie de le sortir" },
    { id: 'understand', label: "Je ne comprends pas quand le sortir" },
    { id: 'nodemand', label: "Le chien ne demande pas pour sortir" },
    { id: 'timing', label: "Problème emploi du temps" },
    { id: 'other', label: "Autre" },
  ];

  const toggleProblem = (id) => {
    setSelectedProblems((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const canProceed = selectedProblems.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.md }}>
        <BackButton onPress={() => navigation.navigate('Onboarding1')} />
        <View style={{ borderRadius: spacing.md, overflow: 'hidden' }}>
          <OnboardingProgressBar percent={30} />
        </View>
      </View>

      {/* Contenu */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.base,
          paddingBottom: spacing.xxl,
        }}
      >
        {/* Titre */}
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: colors.black,
            marginBottom: spacing.xs,
            letterSpacing: -0.5,
          }}
        >
          Vos plus grosses
        </Text>
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing.lg,
            letterSpacing: -0.5,
          }}
        >
          problématiques ?
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
          }}
        >
          Sélectionnez tous les problèmes que vous rencontrez
        </Text>

        {/* Checkboxes */}
        <View style={{ gap: spacing.md }}>
          {problems.map((problem) => (
            <TouchableOpacity
              key={problem.id}
              onPress={() => toggleProblem(problem.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                backgroundColor: selectedProblems.includes(problem.id)
                  ? colors.primaryLight
                  : colors.pupyBackground,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: selectedProblems.includes(problem.id) ? colors.primary : colors.pupyBorder,
              }}
            >
              {/* Checkbox */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: selectedProblems.includes(problem.id) ? colors.primary : colors.gray300,
                  backgroundColor: selectedProblems.includes(problem.id) ? colors.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                {selectedProblems.includes(problem.id) && (
                  <Text style={{ color: colors.pureWhite, fontWeight: 'bold', fontSize: 16 }}>✓</Text>
                )}
              </View>

              {/* Label */}
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: '500',
                  color: colors.black,
                }}
              >
                {problem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bouton Continuer */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Onboarding3', { userProblems: selectedProblems })}
          disabled={!canProceed}
          style={{
            paddingVertical: spacing.md,
            borderRadius: 10,
            backgroundColor: canProceed ? colors.primary : colors.disabled,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.pureWhite,
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding2Screen;
