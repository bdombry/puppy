/**
 * Composant DogCardWithProgress
 * Combine la carte du chien et la barre de propreté dans une même card
 * 🔧 FIX: Utilisation correcte de stats.outside et stats.inside
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Image } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { EMOJI, PERIODS } from '../constants/config';
import { colors } from '../constants/theme';

function getDogAge(birthDate) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  const months = ageDate.getUTCMonth() + ageDate.getUTCFullYear() * 12 - 12 * 1970;
  if (months < 1) return "moins d'un mois";
  if (months === 1) return "1 mois";
  return `${months} mois`;
}

export function DogCardWithProgress({
  dog,
  onSettingsPress,
  stats,
  loading,
  selectedPeriod,
  onPeriodChange,
  progressAnim,
}) {
  return (
    <View style={homeStyles.dogCardWithProgress}>
      {/* Dog Info Section */}
      <View style={homeStyles.dogHeaderContainer}>
        <View style={homeStyles.dogHeaderRow}>
          {dog.photo_url ? (
            <Image 
              source={{ uri: dog.photo_url }} 
              style={homeStyles.dogAvatar}
            />
          ) : (
            <View style={homeStyles.dogAvatar}>
              <Text style={homeStyles.dogAvatarEmoji}>{EMOJI.dog}</Text>
            </View>
          )}
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

      {/* Divider */}
      <View style={homeStyles.dogCardDivider} />

      {/* Progress Section */}
      <View style={homeStyles.progressSectionInCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.periodScroll}
        >
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                homeStyles.periodButton,
                selectedPeriod === period.id
                  ? homeStyles.periodButtonActive
                  : homeStyles.periodButtonInactive,
              ]}
              onPress={() => onPeriodChange(period.id)}
            >
              <Text
                style={[
                  homeStyles.periodText,
                  selectedPeriod === period.id
                    ? homeStyles.periodTextActive
                    : homeStyles.periodTextInactive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={homeStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={homeStyles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <>
            <View style={homeStyles.statsHeader}>
              <Text style={homeStyles.statsTitle}>Propreté</Text>
              <Text style={homeStyles.statsPercentage}>{stats.percentage}%</Text>
            </View>

            <View style={homeStyles.progressBarContainer}>
              <Animated.View
                style={[
                  homeStyles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            {/* 🔧 FIX: Utilisation de stats.outside et stats.inside au lieu de stats.success et stats.incidents */}
            <View style={homeStyles.statsRow}>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statLabel}>Réussi</Text>
                <Text style={homeStyles.statValue}>{stats.outside}</Text>
              </View>
              <View style={homeStyles.dividerVertical} />
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statLabel}>Incidents</Text>
                <Text style={homeStyles.statValue}>{stats.inside}</Text>
              </View>
              <View style={homeStyles.dividerVertical} />
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statLabel}>Total</Text>
                <Text style={homeStyles.statValue}>{stats.total}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

DogCardWithProgress.propTypes = {
  dog: PropTypes.shape({
    name: PropTypes.string.isRequired,
    birth_date: PropTypes.string,
    breed: PropTypes.string,
  }).isRequired,
  onSettingsPress: PropTypes.func.isRequired,
  stats: PropTypes.shape({
    percentage: PropTypes.number.isRequired,
    outside: PropTypes.number.isRequired,  // 🔧 Changé de success
    inside: PropTypes.number.isRequired,   // 🔧 Changé de incidents
    total: PropTypes.number.isRequired,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedPeriod: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  progressAnim: PropTypes.object.isRequired,
};