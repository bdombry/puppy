import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { EMOJI } from '../../constants/config';

export function RecordButton({ onPress }) {
  return (
    <TouchableOpacity
      style={[homeStyles.actionButton, homeStyles.actionButtonPrimary]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={homeStyles.actionButtonRow}>
        <Text style={homeStyles.actionButtonPrimaryIcon}>{EMOJI.history}</Text>
        <Text style={homeStyles.actionButtonTextPrimaryBig}>Enregistrer événement</Text>
      </View>
    </TouchableOpacity>
  );
}
