import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { EMOJI } from '../../constants/config';

export function HistoryButton({ onPress }) {
  return (
    <TouchableOpacity
      style={[homeStyles.actionButton, homeStyles.actionButtonSecondary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={homeStyles.actionButtonRow}>
        <Text style={homeStyles.actionButtonIcon}>{EMOJI.calendar}</Text>
        <Text style={homeStyles.actionButtonTextSecondary}>Voir l'historique</Text>
      </View>
    </TouchableOpacity>
  );
}
