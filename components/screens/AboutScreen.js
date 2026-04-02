import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { commonStyles } from '../../styles/commonStyles';
import { colors, spacing } from '../../constants/theme';
import { EMOJI } from '../../constants/config';

export default function AboutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleOpenLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
    }
  };

  return (
    <View style={[GlobalStyles.safeArea, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md }}>
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 18 }}>{EMOJI.arrowBack}</Text>
        </TouchableOpacity>
        <Text style={commonStyles.h3}>À propos</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* About Info */}
        <View style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gray200, alignItems: 'center' }}>
          <Text style={{ fontSize: 50, marginBottom: spacing.md }}>🐕</Text>
          <Text style={[commonStyles.h3, { textAlign: 'center', marginBottom: spacing.sm }]}>PupyTracker</Text>
          <Text style={[commonStyles.label, { color: colors.gray600 }]}>Version 1.0.1</Text>
          <Text style={[commonStyles.bodySmall, { marginTop: spacing.md, textAlign: 'center', lineHeight: 20, color: colors.gray700 }]}>
            L'application complète pour suivre la santé et le bien-être de votre chiot.
          </Text>
        </View>

        {/* Legal Section */}
        <Text style={[commonStyles.label, { marginBottom: spacing.md }]}>LÉGAL</Text>
        
        <TouchableOpacity
          style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray200, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          onPress={() => handleOpenLink('https://pupytracker.com/terms')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, marginRight: spacing.md }}>📋</Text>
            <Text style={[commonStyles.label, { color: colors.textPrimary }]}>Conditions d'utilisation</Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.primary }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gray200, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          onPress={() => handleOpenLink('https://pupytracker.com/privacy')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, marginRight: spacing.md }}>🔒</Text>
            <Text style={[commonStyles.label, { color: colors.textPrimary }]}>Politique de confidentialité</Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.primary }}>›</Text>
        </TouchableOpacity>

        {/* Credits */}
        <Text style={[commonStyles.label, { marginBottom: spacing.md }]}>CRÉDITS</Text>
        <View style={{ backgroundColor: colors.gray50, padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200 }}>
          <Text style={[commonStyles.bodySmall, { lineHeight: 20, color: colors.gray700, textAlign: 'center' }]}>
            PupyTracker est créé avec ❤️ pour aider les propriétaires de chiots à mieux s'occuper de leurs compagnons.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
