import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const Onboarding8Screen = ({ navigation, route }) => {
  const [showButton, setShowButton] = useState(false);
  const dogData = route?.params?.dogData || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigation.navigate('Onboarding9', { dogData });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={96} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingVertical: spacing.lg }}>
        {/* Contenu principal */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          {/* Titre */}
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}>
            Regardez comment ça
          </Text>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing.lg,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}>
            marche ! 🎬
          </Text>

          {/* Sous-titre */}
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            Enregistrez chaque balade en 2 secondes
          </Text>

          {/* Vidéo */}
          <View style={{
            width: '100%',
            height: 350,
            backgroundColor: '#000',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: spacing.lg,
          }}>
            <Video
              source={require('../../assets/videos/demo-walk.mp4')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              isLooping
              isMuted
              shouldPlay
              useNativeControls={false}
            />
          </View>

          {/* Message court */}
          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
            textAlign: 'center',
          }}>
            Vos promenades, vos statistiques, vos rappels
          </Text>
        </View>

        {/* Bouton visible après 4 secondes */}
        {showButton && (
          <View
            style={{
              width: '100%',
            }}
          >
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
                Essayer maintenant
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

Onboarding8Screen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default Onboarding8Screen;
