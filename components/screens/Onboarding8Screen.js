import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import * as Notifications from 'expo-notifications';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { configureNotificationHandler, requestNotificationPermissions } from '../services/notificationService';

const Onboarding8Screen = ({ navigation, route }) => {
  const [showButton, setShowButton] = useState(false);
  const dogData = route?.params?.dogData || {};
  const userData = route?.params?.userData || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    try {
      // Initialiser le handler et demander les permissions
      configureNotificationHandler();
      const hasPermission = await requestNotificationPermissions();
      
      // Récupérer les noms
      const personName = userData?.name || 'Ami du chiot';
      const dogName = dogData?.name || 'ton chiot';
      
      // Message personnalisé avec infos de la personne et du chien
      const title = `Bienvenue ${personName}! 🎉`;
      const body = `Vous avez fait le bon choix pour ${dogName}!`;

      // Envoyer la notification immédiatement si permission accordée
      if (hasPermission) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            priority: 'high',
            badge: 1,
          },
          trigger: null, // Immédiat
        });
        console.log('✅ Notification envoyée:', title, body);
      } else {
        console.log('⚠️ Permission notifications non accordée, notification non envoyée');
      }
      
      // Naviguer après un petit délai
      setTimeout(() => {
        navigation.navigate('Onboarding9', { dogData, userData });
      }, 300);
    } catch (error) {
      console.error('❌ Erreur notification:', error);
      // Continuer quand même si la notif échoue
      navigation.navigate('Onboarding9', { dogData, userData });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.navigate('Onboarding7')} />
        <OnboardingProgressBar percent={96} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingVertical: spacing.lg }}>
        {/* Contenu principal */}
        <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: spacing.lg }}>
          {/* Titre */}
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: colors.primary,
            marginBottom: spacing.sm,
            textAlign: 'center',
            lineHeight: 35,
          }}>
            Comment ça marche
          </Text>

          {/* Sous-titre */}
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            textAlign: 'center',
            lineHeight: 20,
            fontWeight: '500',
          }}>
            Enregistrez chaque balade ou besoin en quelques secondes
          </Text>

          {/* Vidéo */}
          <View style={{
            width: '100%',
            height: 280,
            backgroundColor: colors.surface,
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.pupyBorder,
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
        </View>

        {/* Bouton visible après 4 secondes */}
        {showButton && (
          <View style={{ paddingVertical: spacing.lg }}>
            <TouchableOpacity
              onPress={handleContinue}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: 'center',
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
                Continuer
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
