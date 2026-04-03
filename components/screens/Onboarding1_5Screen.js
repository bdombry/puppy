import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding1_5Screen = ({ navigation, route }) => {
  const dogData = route?.params?.dogData || {};

  // États pour l'apparition progressive
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Animations d'opacité
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const problemOpacities = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Timeline des apparitions (x2 les timings)
    const timeline = [
      { delay: 600, action: () => setShowTitle(true), animate: titleOpacity },
      { delay: 2200, action: () => setShowSubtitle(true), animate: subtitleOpacity },
      { delay: 3800, action: () => setShowLabel(true), animate: labelOpacity },
      { delay: 3800, action: () => {}, animate: problemOpacities[0] },
      { delay: 5400, action: () => {}, animate: problemOpacities[1] },
      { delay: 7000, action: () => {}, animate: problemOpacities[2] },
      { delay: 8600, action: () => setShowButton(true), animate: buttonOpacity },
    ];

    const timers = timeline.map((item) => {
      return setTimeout(() => {
        item.action();
        Animated.timing(item.animate, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, item.delay);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleContinue = () => {
    navigation.navigate('Onboarding2');
  };

  const problems = [
    { emoji: '🔄', title: 'Les accidents continuent', desc: 'Sans structure, les progrès stagnent' },
    { emoji: '⏱️', title: 'La progression ralentit', desc: 'Votre chiot apprend plus lentement' },
    { emoji: '😰', title: 'La frustration augmente', desc: 'Vous doutez de votre méthode' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.navigate('Onboarding1')} />
        <OnboardingProgressBar current={2} total={13} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' }}>
        {/* Contenu */}
        <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: spacing.lg }}>
          {/* Titre */}
          {showTitle && (
            <Animated.View style={{ opacity: titleOpacity }}>
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
            </Animated.View>
          )}

          {/* Sous-titre */}
          {showSubtitle && (
            <Animated.View style={{ opacity: subtitleOpacity }}>
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
            </Animated.View>
          )}

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: spacing.lg }}>
            {/* Subtitle-style label */}
            {showLabel && (
              <Animated.View style={{ opacity: labelOpacity }}>
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
              </Animated.View>
            )}

            {/* Cartes problèmes */}
            {problems.map((item, idx) => (
              <Animated.View
                key={idx}
                style={{
                  opacity: problemOpacities[idx],
                }}
              >
                <View
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
              </Animated.View>
            ))}
          </View>
        </View>

        {/* CTA */}
        {showButton && (
          <Animated.View
            style={{
              paddingVertical: spacing.lg,
              opacity: buttonOpacity,
            }}
          >
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
                color: colors.pureWhite,
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
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

Onboarding1_5Screen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default Onboarding1_5Screen;
