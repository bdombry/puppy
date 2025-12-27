import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

/**
 * Modal UX pour choisir entre Caméra, Galerie, ou Annuler
 * Design Material + iOS-friendly avec 3 options claires
 */
export default function ImagePickerModal({ visible, onClose, onCamera, onGallery }) {
  
  const handleCamera = () => {
    console.log('📷 Modal: Caméra sélectionnée');
    onCamera();
  };

  const handleGallery = () => {
    console.log('📷 Modal: Galerie sélectionnée');
    onGallery();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      >
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleCamera}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>📷</Text>
            <Text style={styles.optionText}>Prendre une photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleGallery}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>🖼️</Text>
            <Text style={styles.optionText}>Choisir dans la galerie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

ImagePickerModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCamera: PropTypes.func.isRequired,
  onGallery: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '85%',
    maxWidth: 400,
    padding: spacing.md,
    ...shadows.large,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderColor: colors.error,
    marginTop: spacing.sm,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.error,
    textAlign: 'center',
  },
});
