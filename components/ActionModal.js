/**
 * Composant ActionModal
 * Modal pour choisir entre "Incident à la maison" ou "Sortie dehors"
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, View, Text, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { EMOJI } from '../constants/config';

export function ActionModal({ visible, onClose, onIncidentPress, onWalkPress, onActivityPress, onFeedingPress }) {
  const [panY] = React.useState(new Animated.Value(0));
  
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, { dy }) => {
        if (dy > 0) {
          panY.setValue(dy);
        }
      },
      onPanResponderRelease: (evt, { dy }) => {
        if (dy > 100) {
          onClose();
        }
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity 
        style={homeStyles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            { transform: [{ translateY: panY }] }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
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
                <Text style={homeStyles.modalOptionTitle}>Incident</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  Pas au bon endroit
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
                <Text style={homeStyles.modalOptionTitle}>Besoin réussi</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  À l'endroit prévu
                </Text>
              </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.modalOptionButton, homeStyles.modalOptionFeeding]}
              onPress={onFeedingPress}
              activeOpacity={0.8}
            >
            <View style={homeStyles.modalOptionRow}>
              <View
                style={[
                  homeStyles.modalOptionIconContainer,
                  homeStyles.modalOptionIconFeeding,
                ]}
              >
                <Text style={homeStyles.modalOptionIcon}>🍽️</Text>
              </View>
              <View style={homeStyles.modalOptionInfo}>
                <Text style={homeStyles.modalOptionTitle}>Alimentation</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  Recevoir des rappels
                </Text>
              </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.modalOptionButton, homeStyles.modalOptionSuccess]}
              onPress={onActivityPress}
              activeOpacity={0.8}
            >
            <View style={homeStyles.modalOptionRow}>
              <View
                style={[
                  homeStyles.modalOptionIconContainer,
                  homeStyles.modalOptionIconSuccess,
                ]}
              >
                <Text style={homeStyles.modalOptionIcon}>🚶</Text>
              </View>
              <View style={homeStyles.modalOptionInfo}>
                <Text style={homeStyles.modalOptionTitle}>Balade</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  Enregistrer une promenade complète
                </Text>
              </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
              <Text style={homeStyles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

ActionModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onIncidentPress: PropTypes.func.isRequired,
  onWalkPress: PropTypes.func.isRequired,
  onFeedingPress: PropTypes.func.isRequired,
};
