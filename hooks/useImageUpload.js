import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../config/supabase';
import { Alert } from 'react-native';

export const useImageUpload = () => {
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Accès à la galerie photos refusé');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie');
      return null;
    }
  };

  const uploadImage = async (uri, dogId) => {
    try {
      // Lit le fichier directement
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `dog-${dogId}.jpg`;

      // Upload à Supabase Storage avec UPSERT pour remplacer l'existant
      const { data, error } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true, // Remplace la photo existante
        });

      if (error) throw error;

      // Récupère l'URL public
      const { data: urlData } = supabase.storage
        .from('dog-photos')
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

  return { pickImage, uploadImage };
};
