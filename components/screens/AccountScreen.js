import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../styles/global';
import { commonStyles } from '../../styles/commonStyles';
import { colors, spacing } from '../../constants/theme';
import { EMOJI } from '../../constants/config';
import { useUser } from '../../context/UserContext';

const SectionNavButton = ({ emoji, title, subtitle, onPress }) => {
  return (
    <TouchableOpacity
      style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.gray50, borderRadius: 8, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={{ fontSize: 20, marginRight: spacing.md }}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.h4}>{title}</Text>
          {subtitle && <Text style={[commonStyles.bodySmall, { marginTop: spacing.xs }]}>{subtitle}</Text>}
        </View>
      </View>
      <Text style={{ fontSize: 18, color: colors.textSecondary }}>›</Text>
    </TouchableOpacity>
  );
};

export default function AccountScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isPremium } = useUser();

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
        <Text style={commonStyles.h3}>Paramètres</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Big Customization Button */}
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Text style={{ fontSize: 40 }}>⚙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.h3, { color: colors.white, marginBottom: spacing.xs }]}>Personnaliser</Text>
            <Text style={[commonStyles.bodySmall, { color: colors.white, opacity: 0.9 }]}>Plages horaires, âge du chien...</Text>
          </View>
          <Text style={{ fontSize: 24, color: colors.white }}>›</Text>
        </TouchableOpacity>

        {/* INFO Section Title */}
        <Text style={[commonStyles.label, { marginBottom: spacing.md }]}>INFO</Text>

        {/* Section Compte */}
        <View style={{ marginBottom: spacing.md }}>
          <SectionNavButton
            emoji="👤"
            title="Mon compte"
            subtitle="Email et sécurité"
            onPress={() => navigation.navigate('AccountDetail')}
          />
        </View>

        {/* Section Notifications */}
        <View style={{ marginBottom: spacing.md }}>
          <SectionNavButton
            emoji="🔔"
            title="Notifications"
            subtitle="Paramètres système"
            onPress={() => navigation.navigate('NotificationDetail')}
          />
        </View>

        {/* Section Autre - Bouton clickable */}
        {isPremium && (
          <TouchableOpacity
            style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.gray50, borderRadius: 8, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            onPress={() => navigation.navigate('OtherSettings')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 20, marginRight: spacing.md }}>⚙️</Text>
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.h4}>Abonnement</Text>
                <Text style={[commonStyles.bodySmall, { marginTop: spacing.xs }]}>Gérer votre souscription</Text>
              </View>
            </View>
            <Text style={{ fontSize: 18, color: colors.textSecondary }}>›</Text>
          </TouchableOpacity>
        )}

        {/* Section Évaluer */}
        <View style={{ marginBottom: spacing.md }}>
          <SectionNavButton
            emoji="⭐"
            title="Noter Pupytracker"
            subtitle="Donnez-nous votre avis"
            onPress={() => navigation.navigate('RatingApp')}
          />
        </View>

        {/* Section Support */}
        <View style={{ marginBottom: spacing.md }}>
          <SectionNavButton
            emoji="✉️"
            title="Nous contacter"
            subtitle="Questions ou suggestions"
            onPress={() => navigation.navigate('ContactUs')}
          />
        </View>

        {/* Section Légal */}
        <View style={{ marginBottom: spacing.lg }}>
          <SectionNavButton
            emoji="ℹ️"
            title="Légal"
            onPress={() => navigation.navigate('About')}
          />
        </View>
      </ScrollView>
    </View>
  );
}
