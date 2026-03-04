import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Onboarding7Screen = ({ navigation, route }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const dogData = route?.params?.dogData || {};

  const sources = [
    { id: 'app_store', label: 'App Store', icon: '🍎' },
    { id: 'play_store', label: 'Google Play', icon: '🤖' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'instagram', label: 'Instagram', icon: '📷' },
    { id: 'ami_famille', label: 'Ami/Famille', icon: '👥' },
    { id: 'other', label: 'Autre', icon: '❓' },
  ];

  const handleContinue = async () => {
    if (!selected) {
      Alert.alert('Erreur', 'Veuillez sélectionner une source');
      return;
    }

    setLoading(true);
    try {
      // Sauvegarder la source de découverte
      await AsyncStorage.setItem('app_source', selected);
      
      // Naviguer vers Onboarding7 (barre de progression)
      setTimeout(() => {
        navigation.navigate('Onboarding6Name', {
          userData: { app_source: selected, problems: route.params?.userProblems || [] },
          dogData,
        });
      }, 300);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={72} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
        {/* Titre */}
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing.sm,
          letterSpacing: -0.5,
        }}>
          Comment as-tu
        </Text>
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.primary,
          marginBottom: spacing.lg,
          letterSpacing: -0.5,
        }}>
          découvert PupyTracker ?
        </Text>

        {/* Sous-titre */}
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginBottom: spacing.xxxl,
          lineHeight: 24,
        }}>
          Ça nous aide à comprendre où nous sommes visibles 🔍
        </Text>

        {/* Boutons sources */}
        <View style={{ gap: spacing.md, marginBottom: spacing.xxxl }}>
          {sources.map((source) => (
            <TouchableOpacity
              key={source.id}
              onPress={() => setSelected(source.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.lg,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selected === source.id ? colors.primary : colors.gray200,
                backgroundColor: selected === source.id ? '#f0f4ff' : colors.gray100,
              }}
            >
              <Text style={{ fontSize: 32, marginRight: spacing.md }}>
                {source.icon}
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: selected === source.id ? '600' : '500',
                color: selected === source.id ? colors.primary : colors.textPrimary,
                flex: 1,
              }}>
                {source.label}
              </Text>
              {selected === source.id && (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bouton Continuer */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected || loading}
          style={{
            paddingVertical: spacing.md,
            borderRadius: 10,
            backgroundColor: selected ? colors.primary : '#d0d0d0',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            {loading ? 'Finalisation...' : 'C\'est parti ! 🐕'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding7Screen;
