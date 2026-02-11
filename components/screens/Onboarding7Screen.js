import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding7Screen = ({ navigation, route }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const displayProgress = useRef(new Animated.Value(0)).current;
  const [isCompleting, setIsCompleting] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const dogData = route?.params?.dogData || {};
  const appSource = route?.params?.app_source;
  const { saveDog } = useAuth();
  
  const animationStartedRef = useRef(false);

  // Phases avec vitesses variables pour effet réaliste
  const loadingPhases = [
    { start: 0, end: 15, duration: 1200, message: '🐕 Synchronisation du profil...' },
    { start: 15, end: 35, duration: 1800, message: '📊 Initialisation des statistiques...' },
    { start: 35, end: 45, duration: 800, message: '📊 Initialisation des statistiques...' },
    { start: 45, end: 65, duration: 2000, message: '🔔 Configuration des notifications...' },
    { start: 65, end: 80, duration: 1400, message: '🎯 Personnalisation de l\'interface...' },
    { start: 80, end: 95, duration: 1600, message: '🎯 Personnalisation de l\'interface...' },
    { start: 95, end: 100, duration: 1000, message: '✅ Presque prêt !' },
  ];

  useEffect(() => {
    if (animationStartedRef.current) return;
    animationStartedRef.current = true;

    let currentPhaseIndex = 0;

    const animatePhase = () => {
      if (currentPhaseIndex < loadingPhases.length) {
        const phase = loadingPhases[currentPhaseIndex];
        
        // Update message
        setCurrentMessage(phase.message);
        
        // Animate progress bar
        Animated.timing(displayProgress, {
          toValue: phase.end,
          duration: phase.duration,
          useNativeDriver: false,
        }).start();

        // Update numeric progress gradually
        const steps = 20;
        const stepDuration = phase.duration / steps;
        const increment = (phase.end - phase.start) / steps;
        let currentStep = 0;

        const progressInterval = setInterval(() => {
          currentStep++;
          const newProgress = Math.min(
            phase.start + (increment * currentStep),
            phase.end
          );
          setProgress(Math.round(newProgress));

          if (currentStep >= steps) {
            clearInterval(progressInterval);
          }
        }, stepDuration);

        // Move to next phase
        const phaseTimer = setTimeout(() => {
          currentPhaseIndex++;
          animatePhase();
        }, phase.duration + 100);

        return () => {
          clearInterval(progressInterval);
          clearTimeout(phaseTimer);
        };
      } else {
        // Completion sequence
        setTimeout(() => completionSequence(), 500);
      }
    };

    const completionSequence = async () => {
      setIsCompleting(true);
      try {
        if (dogData.name && dogData.breed && dogData.birthDate) {
          await saveDog(dogData);
        }
        setShowButton(true);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        Alert.alert('Erreur', 'Impossible de finir la configuration. Veuillez réessayer.');
        setIsCompleting(false);
      }
    };

    animatePhase();
  }, []);

  const progressWidth = displayProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handleContinue = () => {
    navigation.navigate('Onboarding8', { dogData });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={92} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingVertical: spacing.lg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.sm,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}>
            ✨ On prépare
          </Text>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing.xxxl * 1.5,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}>
            quelque chose de perso !
          </Text>

          <View style={{ width: '100%', marginBottom: spacing.xxxl }}>
            <View style={{
              height: 8,
              backgroundColor: '#e0e0e0',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: spacing.lg,
            }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                  width: progressWidth,
                }}
              />
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 32,
                fontWeight: '700',
                color: colors.primary,
                letterSpacing: 1,
              }}>
                {progress}%
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: spacing.xs,
                letterSpacing: 0.5,
              }}>
                PRÉPARATION EN COURS
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.xxxl, alignItems: 'center', minHeight: 60 }}>
            <Text style={{
              fontSize: 15,
              fontWeight: '500',
              color: colors.textSecondary,
              textAlign: 'center',
            }}>
              {currentMessage}
            </Text>
          </View>
        </View>

        {showButton && (
          <TouchableOpacity
            onPress={handleContinue}
            style={{
              paddingVertical: spacing.md,
              borderRadius: 10,
              backgroundColor: colors.primary,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 16,
            }}>
              Essayer l'app 🚀
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Onboarding7Screen;