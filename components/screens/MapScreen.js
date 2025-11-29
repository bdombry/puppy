import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { EMOJI } from '../../constants/config';

export default function MapScreen() {
  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer} showsVerticalScrollIndicator={false}>
        <Text style={screenStyles.screenTitle}>Map</Text>
        <Text style={screenStyles.screenSubtitle}>Fonctionnalité à venir</Text>
        
        <View style={styles.content}>
          <View style={screenStyles.avatar}>
            <Text style={styles.mapEmoji}>{EMOJI.map}</Text>
          </View>

          <Text style={screenStyles.screenSubtitle}>
            La carte interactive des balades de {EMOJI.dog} sera bientôt disponible
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={screenStyles.iconMedium}>{EMOJI.pin}</Text>
              <Text style={styles.featureText}>Localiser les trajets</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={screenStyles.iconMedium}>{EMOJI.distance}</Text>
              <Text style={styles.featureText}>Voir la distance parcourue</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={screenStyles.iconMedium}>{EMOJI.clock}</Text>
              <Text style={styles.featureText}>Durée des balades</Text>
            </View>
          </View>

          <View style={screenStyles.badge}>
            <Text style={screenStyles.badgeText}>Prochainement ✨</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapEmoji: {
    fontSize: 56,
  },
  featuresList: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
  },
  featureText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.md,
  },
});
