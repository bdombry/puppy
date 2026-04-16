/**
 * Composant ActionModal
 * Modal pour choisir entre "Incident à la maison" ou "Sortie dehors"
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, View, Text, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { EMOJI } from '../constants/config';
import translations from '../constants/translations.fr.json';

const t = translations;

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
          useNativeDriver: true,
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
            <Text style={homeStyles.modalTitle}>{t.screens.home.modal.title}</Text>
            <Text style={homeStyles.modalSubtitle}>{t.screens.home.modal.subtitle}</Text>

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
                <Text style={homeStyles.modalOptionTitle}>{t.screens.home.modal.feeding.title}</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  {t.screens.home.modal.feeding.description}
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
                <Text style={homeStyles.modalOptionTitle}>{t.screens.home.modal.walk.title}</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  {t.screens.home.modal.walk.description}
                </Text>
              </View>
            </View>
            </TouchableOpacity>

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
                <Text style={homeStyles.modalOptionTitle}>{t.screens.home.modal.incident.title}</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  {t.screens.home.modal.incident.description}
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
                <Text style={homeStyles.modalOptionTitle}>{t.screens.home.modal.activity.title}</Text>
                <Text style={homeStyles.modalOptionDescription}>
                  {t.screens.home.modal.activity.description}
                </Text>
              </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
              <Text style={homeStyles.modalCancelText}>{t.screens.home.modal.cancel}</Text>
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
