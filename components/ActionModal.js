/**
 * Composant ActionModal
 * Modal pour choisir entre "Incident à la maison" ou "Sortie dehors"
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { EMOJI } from '../constants/config';

export function ActionModal({ visible, onClose, onIncidentPress, onWalkPress }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={homeStyles.modalOverlay}>
        <View style={homeStyles.modalContent}>
          <View style={homeStyles.modalHandle} />
          <Text style={homeStyles.modalTitle}>Que veux-tu noter ?</Text>
          <Text style={homeStyles.modalSubtitle}>Choisis le type d'événement</Text>

          <TouchableOpacity
            style={[homeStyles.modalOptionButton, homeStyles.modalOptionIncident]}
            onPress={onIncidentPress}
            activeOpacity={0.8}
          >
            <View style={homeStyles.modalOptionRow}>
              <View
                style={[
                  homeStyles.modalOptionIconContainer,
                  homeStyles.modalOptionIconIncident,
                ]}
              >
                <Text style={homeStyles.modalOptionIcon}>{EMOJI.incident}</Text>
              </View>
              <View style={homeStyles.modalOptionInfo}>
                <Text style={homeStyles.modalOptionTitle}>Incident à la maison</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  Pipi ou caca à l'intérieur
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[homeStyles.modalOptionButton, homeStyles.modalOptionSuccess]}
            onPress={onWalkPress}
            activeOpacity={0.8}
          >
            <View style={homeStyles.modalOptionRow}>
              <View
                style={[
                  homeStyles.modalOptionIconContainer,
                  homeStyles.modalOptionIconSuccess,
                ]}
              >
                <Text style={homeStyles.modalOptionIcon}>{EMOJI.walk}</Text>
              </View>
              <View style={homeStyles.modalOptionInfo}>
                <Text style={homeStyles.modalOptionTitle}>Sortie dehors</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  Balade réussie à l'extérieur
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
            <Text style={homeStyles.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

ActionModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onIncidentPress: PropTypes.func.isRequired,
  onWalkPress: PropTypes.func.isRequired,
};
