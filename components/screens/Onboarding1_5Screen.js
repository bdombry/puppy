import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding1_5Screen = ({ navigation, route }) => {
  const dogData = route?.params?.dogData || {};

  const handleContinue = () => {
    navigation.navigate('Onboarding2');
  };

  const problems = [
    { emoji: '🔄', title: 'Les accidents continuent', desc: 'Sans structure, les progrès stagnent' },
    { emoji: '⏱️', title: 'La progression ralentit', desc: 'Votre chiot apprend plus lentement' },
    { emoji: '😰', title: 'La frustration augmente', desc: 'Vous doutez de votre méthode' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar current={2} total={13} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' }}>
        {/* Contenu */}
        <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: spacing.lg }}>
          {/* Titre */}
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: colors.primary,
            marginBottom: spacing.xl,
            lineHeight: 35,
            textAlign: 'center',
          }}>
            Le problème n'est pas votre chiot.
          </Text>

          {/* Sous-titre */}
          <Text style={{
            fontSize: 14,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
            lineHeight: 20,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            Les chiots n'apprennent pas tous seuls.
          </Text>

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: spacing.lg }}>
            {/* Subtitle-style label */}
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing.lg,
              textTransform: 'none',
              letterSpacing: 0,
              lineHeight: 22,
              textAlign: 'center',
            }}>
              Sans approche claire
            </Text>

            {/* Cartes problèmes */}
            {problems.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                backgroundColor: colors.gray100,
                  borderRadius: 12,
                  padding: spacing.md,
                  marginBottom: spacing.xl,
                  alignItems: 'flex-start',
                borderWidth: 1,
                borderColor: colors.gray200,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text style={{ fontSize: 24, marginRight: spacing.xs, marginTop: 2 }}>
                  {item.emoji}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: 4,
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    lineHeight: 20,
                  }}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={{ paddingVertical: spacing.lg }}>
          <TouchableOpacity
            onPress={handleContinue}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 14,
              backgroundColor: colors.primary,
              alignItems: 'center',
              marginBottom: spacing.sm,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text style={{
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: 15,
              letterSpacing: 0.2,
            }}>
              Découvrir la solution →
            </Text>
          </TouchableOpacity>

          <Text style={{
            fontSize: 11,
            color: colors.textSecondary,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            Nous avons la solution pour votre chiot
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

Onboarding1_5Screen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default Onboarding1_5Screen;
