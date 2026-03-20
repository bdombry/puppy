import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { EMOJI } from '../../constants/config';
import { useUser } from '../../context/UserContext';

export default function AccountScreen() {
  const { user, deleteAccount } = useAuth();
  const { isPremium, manageSubscription, premiumLoading } = useUser();
    // Handler pour résilier l'abonnement (ouvrir Customer Center RevenueCat)
    const handleCancelSubscription = async () => {
      try {
        setLoading(true);
        await manageSubscription();
      } catch (err) {
        Alert.alert('Erreur', 'Impossible d’ouvrir la gestion d’abonnement.');
      } finally {
        setLoading(false);
      }
    };
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Se déconnecter',
      'Es-tu sûr de vouloir te déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, se déconnecter',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              
              // Réinitialiser l'onboarding
              await AsyncStorage.setItem('onboardingCompleted', 'false');
              await AsyncStorage.setItem('show_paywall_on_login', 'false');
              
              navigation.replace('Auth');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeletePress = () => {
    Alert.alert(
      '⚠️ Supprimer le compte',
      'Es-tu sûr? Cette action est irréversible. Tous tes chiens et historiques seront supprimés DÉFINITIVEMENT.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, supprimer',
          style: 'destructive',
          onPress: handleSecondConfirmation,
        },
      ]
    );
  };

  const handleSecondConfirmation = () => {
    Alert.alert(
      '🚨 DERNIÈRE CHANCE!',
      'C\'est vraiment ta dernière chance. Veux-tu VRAIMENT supprimer ton compte et TOUTES tes données?',
      [
        { text: 'Non, garder mon compte', style: 'cancel' },
        {
          text: 'OUI, SUPPRIMER DÉFINITIVEMENT',
          style: 'destructive',
          onPress: performDeletion,
        },
      ]
    );
  };

  const performDeletion = async () => {
    setLoading(true);
    try {
      // Supprimer le compte
      await deleteAccount();
      
      // Vider le cache
      await AsyncStorage.clear();
      
      // Réinitialiser onboarding et paywall
      await AsyncStorage.setItem('onboardingCompleted', 'false');
      await AsyncStorage.setItem('show_paywall_on_login', 'false');
      
      Alert.alert('✅ Compte supprimé', 'Ton compte a été supprimé avec succès');
      navigation.replace('Auth');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de supprimer le compte');
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{EMOJI.arrowBack}</Text>
          </TouchableOpacity>
          <Text style={screenStyles.screenTitle}>Mon compte</Text>
        </View>

        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>{EMOJI.envelope} Email</Text>
          <View style={styles.infoBox}>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>⏰ Notifications</Text>
          <TouchableOpacity
            style={[screenStyles.button, styles.notificationButton]}
            onPress={handleNotificationSettings}
          >
            <Text style={screenStyles.buttonText}>Paramètres de notification</Text>
          </TouchableOpacity>
        </View>

        <View style={[screenStyles.section, styles.sectionDanger]}>
                  {/* Résilier abonnement (visible si premium) */}
                  {isPremium && (
                    <TouchableOpacity
                      style={[screenStyles.button, { backgroundColor: colors.warning, marginBottom: spacing.md }]}
                      onPress={handleCancelSubscription}
                      disabled={loading || premiumLoading}
                    >
                      {loading || premiumLoading ? (
                        <ActivityIndicator color={colors.white} size="small" />
                      ) : (
                        <Text style={[screenStyles.buttonText, { color: colors.white }]}>Résilier mon abonnement</Text>
                      )}
                    </TouchableOpacity>
                  )}
          <Text style={screenStyles.sectionTitle}>{EMOJI.warning} Zone dangereuse</Text>
          
          <TouchableOpacity
            style={[screenStyles.button, screenStyles.buttonDanger]}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={screenStyles.buttonDangerText}>Se déconnecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[screenStyles.button, screenStyles.buttonDanger, { marginTop: spacing.md }]}
            onPress={handleDeletePress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={screenStyles.buttonDangerText}>Supprimer mon compte</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: 20,
  },
  sectionDanger: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}10`,
  },
  infoBox: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  email: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  notificationButton: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
});
