import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding9Screen = ({ navigation, route }) => {
  const dogData = route?.params?.dogData || {};
  const userData = route?.params?.userData || {};

  // États pour l'apparition progressive
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Animations d'opacité
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const benefitOpacities = useRef([
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
      { delay: 3800, action: () => {}, animate: benefitOpacities[0] },
      { delay: 5400, action: () => {}, animate: benefitOpacities[1] },
      { delay: 7000, action: () => {}, animate: benefitOpacities[2] },
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

  const handleContinue = async () => {
    try {
      console.log('🚀 Navigating to PaywallReason1...');
      console.log('   dogData:', dogData);
      console.log('   userData:', userData);
      navigation.navigate('PaywallReason1', { dogData, userData });
    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const benefits = [
    {
      emoji: '🎯',
      title: 'Moins d\'accidents',
      desc: 'Au quotidien',
      color: '#FF6B9D',
      bgLight: '#FFE5F0',
    },
    {
      emoji: '💡',
      title: 'Plus de clarté',
      desc: 'Sur ce qui fonctionne',
      color: '#4A90E2',
      bgLight: '#EBF4FF',
    },
    {
      emoji: '📈',
      title: 'Progrès visibles',
      desc: 'Semaine après semaine',
      color: '#7ED321',
      bgLight: '#F0FFDB',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.navigate('Onboarding8')} />
        <OnboardingProgressBar percent={100} />
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
                Une bonne structure change vraiment tout.
              </Text>
            </Animated.View>
          )}

          {/* Sous-titre */}
          {showSubtitle && (
            <Animated.View style={{ opacity: subtitleOpacity }}>
              <Text style={{
                fontSize: 14,
                color: colors.textPrimary,
                lineHeight: 20,
                fontWeight: '500',
                textAlign: 'center',
                marginBottom: spacing.xl,
              }}>
                Avec une méthode adaptée à son âge et sa personnalité, votre chiot progresse rapidement.
              </Text>
            </Animated.View>
          )}

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: spacing.lg }}>
            {/* Cartes bénéfices */}
            {benefits.map((item, idx) => (
              <Animated.View
                key={idx}
                style={{
                  opacity: benefitOpacities[idx],
                }}
              >
                <View
                  style={{
                    backgroundColor: item.bgLight,
                    borderRadius: 12,
                    padding: spacing.md,
                    marginBottom: spacing.xl,
                    borderLeftWidth: 4,
                    borderLeftColor: item.color,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                    <Text style={{ fontSize: 24, marginRight: spacing.xs }}>
                      {item.emoji}
                    </Text>
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: colors.textPrimary,
                      flex: 1,
                    }}>
                      {item.title}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    lineHeight: 22,
                    marginLeft: 40,
                  }}>
                    {item.desc}
                  </Text>
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
                Commencer maintenant
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

Onboarding9Screen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default Onboarding9Screen;