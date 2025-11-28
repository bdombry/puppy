/**
 * Composant StatsCards
 * Affiche les cartes de stats (Total, Streak)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { EMOJI } from '../constants/config';

export function StatsCards({
  totalOutings,
  streakValue,
  streakLabel,
  streakIcon,
  onStreakPress,
}) {
  return (
    <View style={homeStyles.statsCardsRow}>
      <View style={[homeStyles.statCard, homeStyles.statCardLeft]}>
        <View style={[homeStyles.statIconContainer, homeStyles.statIconBlue]}>
          <Text style={homeStyles.statIcon}>{EMOJI.history}</Text>
        </View>
        <Text style={homeStyles.statValue}>{totalOutings}</Text>
        <Text style={homeStyles.statLabel}>Total</Text>
      </View>

      <View style={[homeStyles.statCard, homeStyles.statCardRight]}>
        <TouchableOpacity onPress={onStreakPress}>
          <View style={[homeStyles.statIconContainer, homeStyles.statIconYellow]}>
            <Text style={homeStyles.statIcon}>{streakIcon}</Text>
          </View>
          <Text style={homeStyles.statValue}>
            {streakValue}
          </Text>
          <Text style={homeStyles.statLabel}>
            {streakLabel}
          </Text>
          <Text style={homeStyles.statHint}>Tap pour changer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

StatsCards.propTypes = {
  totalOutings: PropTypes.number.isRequired,
  streakValue: PropTypes.number.isRequired,
  streakLabel: PropTypes.string.isRequired,
  streakIcon: PropTypes.string.isRequired,
  onStreakPress: PropTypes.func.isRequired,
};
