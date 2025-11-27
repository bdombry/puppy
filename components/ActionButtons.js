/**
 * Composant ActionButtons
 * Les boutons d'action principaux (Enregistrer, Historique, Analytics, Déconnexion)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { EMOJI } from '../constants/config';

export function ActionButtons({
  onRecordPress,
  onHistoryPress,
  onAnalyticsPress,
  onLogoutPress,
  isGuestMode,
}) {
  return (
    <View>
      <TouchableOpacity
        style={[homeStyles.actionButton, homeStyles.actionButtonPrimary]}
        onPress={onRecordPress}
        activeOpacity={0.8}
      >
        <View style={homeStyles.actionButtonRow}>
          <Text style={homeStyles.actionButtonIcon}>{EMOJI.history}</Text>
          <Text style={homeStyles.actionButtonTextPrimary}>Enregistrer</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[homeStyles.actionButton, homeStyles.actionButtonSecondary]}
        onPress={onHistoryPress}
        activeOpacity={0.7}
      >
        <View style={homeStyles.actionButtonRow}>
          <Text style={homeStyles.actionButtonIcon}>{EMOJI.calendar}</Text>
          <Text style={homeStyles.actionButtonTextSecondary}>Voir l'historique</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[homeStyles.actionButton, homeStyles.actionButtonSecondary]}
        onPress={onAnalyticsPress}
        activeOpacity={0.7}
      >
        <View style={homeStyles.actionButtonRow}>
          <Text style={homeStyles.actionButtonIcon}>{EMOJI.analytics}</Text>
          <Text style={homeStyles.actionButtonTextSecondary}>Analytics</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onLogoutPress} style={homeStyles.logoutButton}>
        <Text style={homeStyles.logoutText}>
          {isGuestMode ? `${EMOJI.arrowBack} Recommencer` : `${EMOJI.arrowBack} Se déconnecter`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

ActionButtons.propTypes = {
  onRecordPress: PropTypes.func.isRequired,
  onHistoryPress: PropTypes.func.isRequired,
  onAnalyticsPress: PropTypes.func.isRequired,
  onLogoutPress: PropTypes.func.isRequired,
  isGuestMode: PropTypes.bool.isRequired,
};
