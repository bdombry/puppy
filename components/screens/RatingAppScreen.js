import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { commonStyles } from '../../styles/commonStyles';
import { colors, spacing } from '../../constants/theme';
import { EMOJI } from '../../constants/config';

export default function RatingAppScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleOpenAppStore = async () => {
    const iosUrl = 'itms-apps://apps.apple.com/app/pupytracker/id6739898473?action=write-review';
    const androidUrl = 'https://play.google.com/store/apps/details?id=com.pupytracker';
    
    try {
      const url = Platform.OS === 'ios' ? iosUrl : androidUrl;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(androidUrl);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'App Store');
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
        <Text style={commonStyles.h3}>Noter l'app</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text style={{ fontSize: 60, marginBottom: spacing.md }}>⭐</Text>
          <Text style={[commonStyles.h3, { textAlign: 'center' }]}>Aimez Pupytracker?</Text>
        </View>

        {/* Info Card */}
        <View style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gray200 }}>
          <Text style={[commonStyles.bodySmall, { lineHeight: 22, color: colors.gray700, textAlign: 'center' }]}>
            Votre avis nous aide à améliorer Pupytracker et à atteindre plus de propriétaires de chiots!
          </Text>
        </View>

        {/* Rating Button */}
        <TouchableOpacity
          style={[commonStyles.buttonPrimaryLarge, { backgroundColor: colors.warning, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md }]}
          onPress={handleOpenAppStore}
        >
          <Text style={{ fontSize: 20 }}>⭐</Text>
          <Text style={commonStyles.buttonText}>Noter l'app</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
