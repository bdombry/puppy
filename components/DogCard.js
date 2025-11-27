/**
 * Composant DogCard
 * Affiche les informations du chien (nom, race, âge, actions)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { EMOJI } from '../constants/config';

function getDogAge(birthDate) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  const months = ageDate.getUTCMonth() + ageDate.getUTCFullYear() * 12 - 12 * 1970;
  if (months < 1) return "moins d'un mois";
  if (months === 1) return "1 mois";
  return `${months} mois`;
}

export function DogCard({ dog, onSettingsPress }) {
  return (
    <View style={homeStyles.dogCard}>
      {/* Header */}
      <View style={homeStyles.dogHeaderContainer}>
        <View style={homeStyles.dogHeaderRow}>
          <View style={homeStyles.dogAvatar}>
            <Text style={homeStyles.dogAvatarEmoji}>{EMOJI.dog}</Text>
          </View>
          <View style={homeStyles.dogInfo}>
            <Text style={homeStyles.dogName}>{dog.name}</Text>
          </View>
          <TouchableOpacity
            style={homeStyles.settingsButton}
            onPress={onSettingsPress}
          >
            <Text style={homeStyles.settingsIcon}>{EMOJI.settings}</Text>
          </TouchableOpacity>
        </View>

        <View style={homeStyles.dogMetaRow}>
          <Text style={homeStyles.dogAge}>
            {getDogAge(dog.birth_date) || 'Âge inconnu'}
          </Text>
          {dog.breed && (
            <>
              <View style={homeStyles.dogMetaDot} />
              <Text style={homeStyles.dogBreed}>{dog.breed}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

DogCard.propTypes = {
  dog: PropTypes.shape({
    name: PropTypes.string.isRequired,
    birth_date: PropTypes.string,
    breed: PropTypes.string,
  }).isRequired,
  onSettingsPress: PropTypes.func.isRequired,
};
