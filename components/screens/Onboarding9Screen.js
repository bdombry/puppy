import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors, spacing } from '../../constants/theme';

const Onboarding9Screen = ({ navigation, route }) => {
  const dogData = route?.params?.dogData || {};

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ justifyContent: 'space-between', flex: 1 }}>
          {/* Contenu */}
          <View>
            {/* Titre */}
            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.primary,
              marginBottom: spacing.lg,
              lineHeight: 38,
            }}>
              👉 Le problème n'est pas votre chiot.
            </Text>

            {/* Intro */}
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
              lineHeight: 24,
              fontWeight: '500',
            }}>
              Les chiots n'apprennent pas la propreté par hasard.
            </Text>

            {/* Section 1 : Besoins */}
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing.md,
              marginTop: spacing.lg,
            }}>
              Ils ont besoin :
            </Text>

            <View style={{ marginBottom: spacing.lg }}>
              {['d\'un timing précis', 'de signaux cohérents', 'd\'une routine adaptée à leur âge'].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text style={{ fontSize: 16, marginRight: spacing.sm }}>✅</Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* Section 2 : Problème */}
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
              lineHeight: 22,
              fontStyle: 'italic',
            }}>
              Sans structure claire, même les maîtres motivés ralentissent l'apprentissage… sans le savoir.
            </Text>

            {/* Section 3 : Solution */}
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
              lineHeight: 22,
            }}>
              C'est pour ça que nous avons créé une méthode simple qui guide chaque étape.
            </Text>

            {/* Section 4 : Bénéfices */}
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing.md,
              marginTop: spacing.lg,
            }}>
              👉 Micro bénéfices :
            </Text>

            <View style={{ marginBottom: spacing.xxxl }}>
              {['Moins d\'accidents', 'Moins de stress', 'Des progrès visibles'].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text style={{ fontSize: 16, marginRight: spacing.sm }}>✔</Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bouton */}
          <TouchableOpacity
            onPress={handleContinue}
            style={{
              paddingVertical: spacing.md,
              borderRadius: 10,
              backgroundColor: colors.primary,
              alignItems: 'center',
              width: '100%',
              marginTop: spacing.lg,
            }}
          >
            <Text style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 16,
            }}>
              Découvrir la solution
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

Onboarding9Screen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

export default Onboarding9Screen;
