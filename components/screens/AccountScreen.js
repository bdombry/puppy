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
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { EMOJI } from '../../constants/config';

export default function AccountScreen() {
  const { user, deleteAccount } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
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
          <Text style={screenStyles.sectionTitle}>{EMOJI.warning} Zone dangereuse</Text>
          <TouchableOpacity
            style={[screenStyles.button, screenStyles.buttonDanger]}
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
