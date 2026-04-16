import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { EMOJI } from '../../constants/config';
import translations from '../../constants/translations.fr.json';

const t = translations;

export function LogoutButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={homeStyles.logoutButton}>
      <Text style={homeStyles.logoutText}>
        {`${EMOJI.arrowBack} ${t.screens.home.buttons.logout}`}
      </Text>
    </TouchableOpacity>
  );
}
