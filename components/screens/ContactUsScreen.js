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

export default function ContactUsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleContactUs = async () => {
    const email = 'contact@pupytracker.com';
    const subject = encodeURIComponent('Contact Pupytracker');
    const url = `mailto:${email}?subject=${subject}`;
    
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le client email');
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
        <Text style={commonStyles.h3}>Support</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text style={{ fontSize: 60, marginBottom: spacing.md }}>📧</Text>
          <Text style={[commonStyles.h3, { textAlign: 'center' }]}>Nous contacter</Text>
        </View>

        {/* Info Card */}
        <View style={{ backgroundColor: colors.gray50, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gray200 }}>
          <Text style={[commonStyles.bodySmall, { lineHeight: 22, color: colors.gray700, textAlign: 'center' }]}>
            Des questions, des suggestions ou des problèmes? N'hésitez pas à nous contacter, nous répondons rapidement!
          </Text>
        </View>

        {/* Contact Button */}
        <TouchableOpacity
          style={[commonStyles.buttonPrimaryLarge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md }]}
          onPress={handleContactUs}
        >
          <Text style={{ fontSize: 20 }}>📧</Text>
          <Text style={commonStyles.buttonText}>Envoyer un email</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
