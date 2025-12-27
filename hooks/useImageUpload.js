import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../config/supabase';
import { Alert } from 'react-native';

export const useImageUpload = () => {
  /**
   * Ouvre la galerie pour choisir une image
   * @param {Object} options - Options optionnelles (aspect, quality)
   */
  const pickImage = async (options = {}) => {
    try {
      console.log('📷 pickImage: Demande de permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📷 pickImage: Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Accès à la galerie photos refusé');
        return null;
      }

      console.log('📷 pickImage: Ouverture de la galerie...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Nouvelle API SDK 51+
        allowsEditing: true,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 0.8,
      });

      console.log('📷 pickImage: Résultat:', result.canceled ? 'annulé' : 'image sélectionnée');
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('📷 pickImage: Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie: ' + error.message);
      return null;
    }
  };

  /**
   * Ouvre la caméra pour prendre une photo
   * @param {Object} options - Options optionnelles (aspect, quality)
   */
  const takePhoto = async (options = {}) => {
    try {
      console.log('📷 takePhoto: Demande de permissions...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 takePhoto: Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Accès à la caméra refusé');
        return null;
      }

      console.log('📷 takePhoto: Ouverture de la caméra...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], // Nouvelle API SDK 51+
        allowsEditing: true,
        aspect: options.aspect || [4, 3],
        quality: options.quality || 0.8,
      });

      console.log('📷 takePhoto: Résultat:', result.canceled ? 'annulé' : 'photo prise');
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('📷 takePhoto: Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder à la caméra: ' + error.message);
      return null;
    }
  };

  /**
   * Upload une photo de profil chien vers dog-photos bucket
   */
  const uploadImage = async (uri, dogId) => {
    try {
      // Lit le fichier directement
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `dog-${dogId}.jpg`;

      // Upload à Supabase Storage avec UPSERT pour remplacer l'existant
      const { data, error } = await supabase.storage
        .from('walk-photos')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true, // Remplace la photo existante
        });

      if (error) throw error;

      // Récupère l'URL public
      const { data: urlData } = supabase.storage
        .from('walk-photos')
        .getPublicUrl(fileName);

      // Ajoute un timestamp pour forcer le refresh du cache
      const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      return freshUrl;
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Erreur', 'Impossible d\'uploader la photo: ' + err.message);
      throw err;
    }
  };

  /**
   * Upload une photo de balade vers dog-photos bucket (sous-dossier walks)
   * @param {string} uri - URI locale de l'image
   * @param {string} dogId - ID du chien
   * @returns {string} URL publique de la photo
   */
  const uploadWalkPhoto = async (uri, dogId) => {
    try {
      // Lit le fichier directement
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      
      // Génère un nom unique avec timestamp dans un sous-dossier walks
      const timestamp = Date.now();
      const fileName = `walks/walk-${dogId}-${timestamp}.jpg`;

      console.log('📷 Upload walk photo:', fileName);

      // Upload à Supabase Storage (utilise dog-photos qui existe)
      const { data, error } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false, // Chaque photo est unique
        });

      if (error) throw error;

      // Récupère l'URL public
      const { data: urlData } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(fileName);

      console.log('✅ Walk photo uploaded:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Walk photo upload error:', err);
      Alert.alert('Erreur', 'Impossible d\'uploader la photo de balade: ' + err.message);
      throw err;
    }
  };

  return { pickImage, takePhoto, uploadImage, uploadWalkPhoto };
};
