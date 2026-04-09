import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const PaywallReason2Screen = ({ navigation, route }) => {
  const [showTitle, setShowTitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeline = [
      { delay: 400, action: () => setShowTitle(true), animate: titleOpacity },
      { delay: 1200, action: () => setShowDescription(true), animate: descriptionOpacity },
      { delay: 2400, action: () => setShowButton(true), animate: buttonOpacity },
    ];

    const timers = timeline.map((item) => {
      return setTimeout(() => {
        item.action();
        Animated.timing(item.animate, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, item.delay);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [titleOpacity, descriptionOpacity, buttonOpacity]);

  const handleContinue = () => {
    const dogData = route?.params?.dogData || {};
    const userData = route?.params?.userData || {};
    navigation.navigate('PaywallReason3', {
      dogData,
      userData,
      onDismissReasons: route?.params?.onDismissReasons,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.navigate('PaywallReason1')} />
        <OnboardingProgressBar percent={100} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingVertical: spacing.lg, position: 'relative' }}>
        {/* Mascotte en bas à gauche */}
        <View style={{
          position: 'absolute',
          bottom: -200,
          left: -200,
          zIndex: 0,
        }}>
          <Image
            source={require('../../assets/illustrations/mascotte_happy.png')}
            style={{
              width: 600,
              height: 600,
              transform: [{ rotate: '15deg' }],
            }}
            resizeMode="contain"
          />
        </View>

        {/* Contenu */}
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: spacing.xxxl + spacing.xxl }}>
          {/* Emoji */}
          {showTitle && (
            <Animated.View style={{ opacity: titleOpacity }}>
              <Text style={{ fontSize: 64, marginBottom: spacing.lg, textAlign: 'center' }}>
                🔔
              </Text>
            </Animated.View>
          )}

          {/* Titre */}
          {showTitle && (
            <Animated.View style={{ opacity: titleOpacity }}>
              <Text style={{
                fontSize: 28,
                fontWeight: '800',
                color: colors.primary,
                marginBottom: spacing.lg,
                textAlign: 'center',
                lineHeight: 35,
              }}>
                Notifications intelligentes
              </Text>
            </Animated.View>
          )}

          {/* Description */}
          {showDescription && (
            <Animated.View style={{ opacity: descriptionOpacity, maxWidth: 280 }}>
              <Text style={{
                fontSize: 16,
                color: colors.black,
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Des rappels personnalisés selon l'âge et le comportement de votre chien. Jamais de faux alerte.
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Bouton */}
        {showButton && (
          <Animated.View style={{ opacity: buttonOpacity }}>
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
                Suivant
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

PaywallReason2Screen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default PaywallReason2Screen;
