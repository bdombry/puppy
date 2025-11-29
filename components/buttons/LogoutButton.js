import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { EMOJI } from '../../constants/config';

export function LogoutButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={homeStyles.logoutButton}>
      <Text style={homeStyles.logoutText}>
        {`${EMOJI.arrowBack} Se déconnecter`}
      </Text>
    </TouchableOpacity>
  );
}
