import React, { useState, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding1Screen = ({ navigation }) => {
  const [progressValue] = useState(new Animated.Value(0));
  const [displayPercent, setDisplayPercent] = useState(0);
  const [dogScale] = useState(new Animated.Value(1));
  const [textOpacity] = useState(new Animated.Value(0));
  const [headlineOpacity] = useState(new Animated.Value(0));
  const [bodyOpacity] = useState(new Animated.Value(0));
  const [buttonOpacity] = useState(new Animated.Value(0));
  const [mascotteY] = useState(new Animated.Value(300));
  const [sparkles] = useState([
    { opacity: new Animated.Value(0), top: -60, left: 0 },
    { opacity: new Animated.Value(0), top: -55, right: 0 },
    { opacity: new Animated.Value(0), bottom: 40, left: -10 },
    { opacity: new Animated.Value(0), bottom: 45, right: -15 },
  ]);
  const [particleOpacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    // Listener pour arrondir à l'unité
    const listenerId = progressValue.addListener(({ value }) => {
      setDisplayPercent(Math.round(value * 100));
    });

    const animations = [
      // Jauge de progression se remplit
      Animated.timing(progressValue, {
        toValue: 1,
        duration: 2400,
        useNativeDriver: false,
      }),
    ];

    Animated.sequence(animations).start();

    // Mascotte arrive d'en bas avec bounce
    setTimeout(() => {
      Animated.spring(mascotteY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 2200);

    // Headline apparaît après (3800ms)
    setTimeout(() => {
      Animated.timing(headlineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 3800);

    // Texte du corps apparaît après (5100ms)
    setTimeout(() => {
      Animated.timing(bodyOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 5100);

    // Bouton apparaît après (6100ms)
    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 6100);

    // Scintilles d'émerveillement autour du chien
    setTimeout(() => {
      sparkles.forEach((sparkle, index) => {
        const sparkleAnim = Animated.loop(
          Animated.sequence([
            Animated.timing(sparkle.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(300),
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(400 + index * 150),
          ])
        );
        sparkleAnim.start();
      });
    }, 1500);

    // Particules animation continue
    const particleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(particleOpacity, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particleOpacity, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    particleAnim.start();

    return () => {
      particleAnim.stop();
      progressValue.removeListener(listenerId);
    };
  }, []);

  const { width } = useWindowDimensions();

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressPercent = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Background bleu courbe - moitié basse avec vague douce */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          backgroundColor: colors.primary,
          zIndex: 50,
        }}
      />
      
      {/* Vague courbe au-dessus du background bleu */}
      <View
        style={{
          position: 'absolute',
          bottom: '55%',
          left: 0,
          right: 0,
          height: 100,

          zIndex: 51,
        }}
      >
        <Svg width={width} height={100} viewBox={`0 0 ${width} 100`} preserveAspectRatio="none">
          <Path
            d={`M0,50 Q${width / 2},0 ${width},50 L${width},100 L0,100 Z`}
            fill={colors.primary}
          />
        </Svg>
      </View>

      {/* Particules de fond - en arrière */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: particleOpacity,
          pointerEvents: 'none',
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: spacing.base,
          }}
        >
          <Text style={{ fontSize: 60, opacity: 0.2 }}>✨</Text>
          <Text style={{ fontSize: 50, opacity: 0.15, marginLeft: '60%' }}>✨</Text>
          <Text style={{ fontSize: 55, opacity: 0.2, marginLeft: '20%' }}>✨</Text>
        </View>
      </Animated.View>

      {/* Mascotte Persil - positionnée derrière le fond bleu */}
      <Animated.View
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          marginLeft: -275,
          width: 550,
          height: 550,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 25,
          transform: [{ translateY: mascotteY }],
        }}
      >
        <Image
          source={require('../../assets/illustrations/mascotte_happy.png')}
          style={{ width: 520, height: 520, resizeMode: 'contain' }}
        />
      </Animated.View>

      {/* Contenu principal - au-dessus */}
      <View style={{ flex: 1, zIndex: 100, justifyContent: 'space-between' }}>
        {/* Header (no progress bar on first screen) */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.base, marginBottom: spacing.md }} />

        {/* Centre du contenu */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.base,
          }}
        >
          {/* Chien animé avec scintilles d'émerveillement */}
          <Animated.View
            style={{
              transform: [{ scale: dogScale }],
              marginBottom: spacing.xxxl,
              position: 'relative',
              width: 160,
              height: 160,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Scintilles autour du chien */}
            {sparkles.map((sparkle, idx) => (
              <Animated.Text
                key={idx}
                style={{
                  position: 'absolute',
                  fontSize: 32,
                  opacity: sparkle.opacity,
                  top: sparkle.top,
                  left: sparkle.left,
                  bottom: sparkle.bottom,
                  right: sparkle.right,
                }}
              >
                ✨
              </Animated.Text>
            ))}
          </Animated.View>

          {/* Jauge de progression du chien */}
          <View
            style={{
              width: '85%',
              gap: spacing.sm,
              marginBottom: spacing.xxxl,
              marginTop: -spacing.xl,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: spacing.md,
              borderRadius: spacing.md,
            }}
          >
            {/* Label avec niveau */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  fontWeight: '600',
                  color: colors.black,
                }}
              >
                Propreté du chien
              </Text>
              <Animated.Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: '700',
                  color: colors.black,
                }}
              >
                {displayPercent}%
              </Animated.Text>
            </View>

            {/* Barre de progression */}
            <View
              style={{
                width: '100%',
                height: 28,
                backgroundColor: colors.gray200,
                borderRadius: 50,
                overflow: 'hidden',
                shadowColor: colors.success,
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Animated.View
                style={{
                  width: progressWidth,
                  height: '100%',
                  backgroundColor: '#F2A43B',
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            </View>
          </View>

          {/* Texte principal animé */}
          <Animated.View
            style={{
              opacity: headlineOpacity,
              gap: spacing.md,
            }}
          >
            {/* Headline principale */}
            <Text
              style={{
                fontSize: typography.sizes.xxxl,
                fontWeight: '900',
                color: colors.white,
                textAlign: 'center',
                lineHeight: 40,
                letterSpacing: -0.5,
              }}
            >
              <Text>Bienvenue sur PupyTracker</Text>
            </Text>
          </Animated.View>

          {/* Corps du texte animé */}
          <Animated.View
            style={{
              opacity: bodyOpacity,
              gap: spacing.md,
              marginTop: spacing.md,
            }}
          >
            {/* Sous-texte avec promesse claire */}
            <Text
              style={{
                fontSize: typography.sizes.lg,
                fontWeight: '600',
                color: colors.white,
                textAlign: 'center',
                lineHeight: 28,
                opacity: 0.95,
              }}
            >
              Apprenez la propreté à votre chien en 3 mois
            </Text>
          </Animated.View>
        </View>

        {/* Footer avec boutons */}
        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base, gap: spacing.md }}>
          {/* Bouton Continuer */}
          <Animated.View
            style={{
              opacity: buttonOpacity,
              marginTop: -spacing.lg,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Onboarding1_5')}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.xl,
                borderRadius: 16,
                backgroundColor: '#F2A43B',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#06b6a6',
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
          >
            <Text
              style={{
                fontSize: typography.sizes.lg,
                color: colors.white,
                fontWeight: '700',
                letterSpacing: 0.5,
              }}
            >
              C'est parti ! 🐕
            </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Bouton Se connecter */}
          <Animated.View
            style={{
              opacity: buttonOpacity,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Auth')}
            >
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  color: colors.white,
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: 0.5,
                }}
              >
                Vous avez déjà un compte ? Se connecter
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding1Screen;
