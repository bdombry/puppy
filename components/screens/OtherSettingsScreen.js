import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { GlobalStyles } from '../../styles/global';
import { commonStyles } from '../../styles/commonStyles';
import { colors, spacing } from '../../constants/theme';
import { EMOJI } from '../../constants/config';

export default function OtherSettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isPremium, manageSubscription, premiumLoading } = useUser();
  const [loading, setLoading] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await manageSubscription();
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la gestion d\'abonnement.');
    } finally {
      setLoading(false);
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
        <Text style={commonStyles.h3}>Abonnement</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {isPremium ? (
          <>
            {/* Premium Status Card */}
            <View style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gray200, alignItems: 'center' }}>
              <Text style={{ fontSize: 50, marginBottom: spacing.md }}>👑</Text>
              <Text style={[commonStyles.h3, { textAlign: 'center' }]}>Vous êtes premium</Text>
              <Text style={[commonStyles.bodySmall, { textAlign: 'center', marginTop: spacing.md, color: colors.gray700 }]}>Merci de votre soutien et de votre confiance!</Text>
            </View>

            {/* Manage Subscription Button */}
            <TouchableOpacity
              style={[commonStyles.buttonPrimaryLarge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md }]}
              onPress={handleCancelSubscription}
              disabled={loading || premiumLoading}
            >
              {loading || premiumLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={{ fontSize: 20 }}>💳</Text>
                  <Text style={commonStyles.buttonText}>Gérer l'abonnement</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray200, alignItems: 'center' }}>
            <Text style={{ fontSize: 50, marginBottom: spacing.md }}>📱</Text>
            <Text style={[commonStyles.h3, { textAlign: 'center' }]}>Version gratuite</Text>
            <Text style={[commonStyles.bodySmall, { textAlign: 'center', marginTop: spacing.md, color: colors.gray700 }]}>Découvrez nos fonctionnalités premium</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
