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
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { EMOJI } from '../../constants/config';

export default function AccountScreen() {
  const { user, deleteAccount } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

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
    <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{EMOJI.gear} Mon compte</Text>
        </View>

        <View style={styles.content}>
          {/* Section Email */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{EMOJI.envelope} Email</Text>
            <View style={styles.infoBox}>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>

          {/* Section Danger */}
          <View style={[styles.section, styles.sectionDanger]}>
            <Text style={styles.sectionTitle}>{EMOJI.warning} Zone dangereuse</Text>
            <TouchableOpacity
              style={styles.buttonDanger}
              onPress={handleDeletePress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonDangerText}>Supprimer mon compte</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },

  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  sectionDanger: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}10`,
  },

  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
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
    fontWeight: typography.weights.semibold,
  },

  buttonDanger: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    ...shadows.small,
  },
  buttonDangerText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
