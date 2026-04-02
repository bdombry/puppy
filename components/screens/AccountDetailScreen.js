import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { commonStyles } from '../../styles/commonStyles';
import { colors, spacing } from '../../constants/theme';
import { EMOJI } from '../../constants/config';

export default function AccountDetailScreen() {
  const { user, deleteAccount } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

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
      await deleteAccount();
      
      await AsyncStorage.clear();
      
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
    <View style={[GlobalStyles.safeArea, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md }}>
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 18 }}>{EMOJI.arrowBack}</Text>
        </TouchableOpacity>
        <Text style={commonStyles.h3}>Mon compte</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Email Card */}
        <View style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gray200 }}>
          <Text style={[commonStyles.label, { marginBottom: spacing.sm, color: colors.gray600 }]}>👤 Adresse email</Text>
          <Text style={[commonStyles.h4, { color: colors.textPrimary }]}>{user?.email}</Text>
        </View>

        {/* Danger Zone */}
        <Text style={[commonStyles.label, { marginBottom: spacing.md, color: colors.error }]}>⚠️ ZONE DE DANGER</Text>

        {/* Logout Button */}
        <TouchableOpacity
          style={[commonStyles.buttonPrimaryLarge, { backgroundColor: colors.warning, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md }]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Text style={{ fontSize: 18 }}>🚪</Text>
              <Text style={commonStyles.buttonText}>Se déconnecter</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={[commonStyles.buttonPrimaryLarge, { backgroundColor: colors.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md }]}
          onPress={handleDeletePress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Text style={{ fontSize: 18 }}>🗑️</Text>
              <Text style={commonStyles.buttonText}>Supprimer mon compte</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
