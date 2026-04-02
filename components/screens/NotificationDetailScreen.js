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

export default function NotificationDetailScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleOpenSystemNotifications = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openURL(
          'android.settings.APP_NOTIFICATION_SETTINGS?app_package=com.dombry.PupyTracker'
        );
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir les paramètres');
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
        <Text style={commonStyles.h3}>Notifications</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text style={{ fontSize: 60, marginBottom: spacing.md }}>🔔</Text>
          <Text style={[commonStyles.h3, { textAlign: 'center' }]}>Notifications</Text>
        </View>

        {/* Info Card */}
        <View style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gray200 }}>
          <Text style={[commonStyles.bodySmall, { lineHeight: 22, color: colors.gray700, textAlign: 'center' }]}>
            Gérez vos notifications au niveau du système d'exploitation pour mieux contrôler les alertes Pupytracker.
          </Text>
        </View>

        {/* Button to Open Settings */}
        <TouchableOpacity
          style={[commonStyles.buttonPrimaryLarge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md }]}
          onPress={handleOpenSystemNotifications}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
          <Text style={commonStyles.buttonText}>Ouvrir les paramètres</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
