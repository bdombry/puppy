import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import { EMOJI } from '../../constants/config';
import SexToggle from '../SexToggle';
import { useImageUpload } from '../../hooks/useImageUpload';

export default function DogProfileScreen() {
  const { currentDog, user, setCurrentDog } = useAuth();
  const navigation = useNavigation();
  const { pickImage, uploadImage } = useImageUpload();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentDog?.name || '');
  const [breed, setBreed] = useState(currentDog?.breed || '');
  const [sex, setSex] = useState(currentDog?.sex || 'female');
  const [birthDate, setBirthDate] = useState(
    currentDog?.birth_date ? new Date(currentDog.birth_date) : null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentDog?.photo_url || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const getDogAge = (birthDate) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    const months = ageDate.getUTCMonth() + ageDate.getUTCFullYear() * 12 - 12 * 1970;
    if (months < 1) return "moins d'un mois";
    if (months === 1) return '1 mois';
    return `${months} mois`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du chiot est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const dogData = {
        name: name.trim(),
        breed: breed.trim() || null,
        sex: sex,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
        photo_url: photoUrl,
      };

      const { data, error } = await supabase
        .from('Dogs')
        .update(dogData)
        .eq('id', currentDog.id)
        .select()
        .single();

      if (error) throw error;
      setCurrentDog(data);

      Alert.alert(' Succès', 'Les informations ont été mises à jour');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de sauvegarder les modifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      ' Supprimer le profil',
      `Veux-tu vraiment supprimer le profil de ${currentDog?.name} ?\n\nToutes les données seront perdues.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              ' Confirmation finale',
              `Dernière chance ! Êtes-vous sûr de vouloir supprimer ${currentDog?.name} ?\n\nCette action est IRRÉVERSIBLE.`,
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'OUI, SUPPRIMER',
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      await supabase
                        .from('outings')
                        .delete()
                        .eq('dog_id', currentDog.id);

                      const { error } = await supabase
                        .from('Dogs')
                        .delete()
                        .eq('id', currentDog.id);

                      if (error) throw error;
                      navigation.replace('DogSetup');
                    } catch (error) {
                      Alert.alert('Erreur', 'Impossible de supprimer le profil');
                      console.error(error);
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setName(currentDog?.name || '');
    setBreed(currentDog?.breed || '');
    setSex(currentDog?.sex || 'female');
    setBirthDate(currentDog?.birth_date ? new Date(currentDog.birth_date) : null);
    setPhotoUrl(currentDog?.photo_url || null);
    setIsEditing(false);
  };

  const handleChangePhoto = async () => {
    const uri = await pickImage();
    if (uri) {
      setUploadingPhoto(true);
      try {
        const url = await uploadImage(uri, currentDog.id);
        setPhotoUrl(url);

        // Sauvegarde l'URL dans la base de données
        const { error } = await supabase
          .from('Dogs')
          .update({ photo_url: url })
          .eq('id', currentDog.id);

        if (error) throw error;
        
        // Update le contexte pour que HomeScreen se mette à jour
        setCurrentDog({ ...currentDog, photo_url: url });
        
        Alert.alert('✅ Succès', 'Photo mise à jour!');
      } catch (err) {
        console.error('Upload failed:', err);
        Alert.alert('Erreur', 'Impossible de sauvegarder la photo');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  if (!currentDog) {
    return (
      <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
        <View style={screenStyles.emptyContainer}>
          <Text style={screenStyles.emptyIcon}>{EMOJI.dog}</Text>
          <Text style={screenStyles.emptyText}>Aucun chien enregistré</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer}>

        {/* Bouton pour ajouter un autre chien */}
        <TouchableOpacity
          style={styles.addDogButton}
          onPress={() => navigation.navigate('AddDog')}
          activeOpacity={0.8}
        >
          <View style={styles.addDogButtonContent}>
            <View style={styles.addDogButtonIcon}>
              <Text style={styles.addDogButtonIconText}>+</Text>
            </View>
            <View style={styles.addDogButtonTextContainer}>
              <Text style={styles.addDogButtonTitle}>Ajouter un chien</Text>
              <Text style={styles.addDogButtonSubtitle}>Gérer plusieurs compagnons</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Profil du chien</Text>

        <View style={styles.avatarSection}>
          <TouchableOpacity 
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
            style={styles.avatarContainer}
          >
            {uploadingPhoto ? (
              <View style={[screenStyles.avatar, styles.loadingAvatar]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : photoUrl ? (
              <Image 
                source={{ uri: photoUrl }} 
                style={[screenStyles.avatar, styles.photoAvatar]}
              />
            ) : (
              <View style={screenStyles.avatar}>
                <Text style={screenStyles.avatarEmoji}>{EMOJI.dog}</Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}> Modifier</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.form}>
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Nom *</Text>
            {isEditing ? (
              <TextInput
                style={screenStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Max"
                editable={!loading}
              />
            ) : (
              <View style={screenStyles.valueBox}>
                <Text style={screenStyles.value}>{currentDog.name}</Text>
              </View>
            )}
          </View>

          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Race</Text>
            {isEditing ? (
              <TextInput
                style={screenStyles.input}
                value={breed}
                onChangeText={setBreed}
                placeholder="Ex: Golden Retriever"
                editable={!loading}
              />
            ) : (
              <View style={screenStyles.valueBox}>
                <Text style={screenStyles.value}>
                  {currentDog.breed || 'Non renseignée'}
                </Text>
              </View>
            )}
          </View>

          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Sexe</Text>
            {isEditing ? (
              <SexToggle
                value={sex}
                onValueChange={setSex}
                disabled={loading}
              />
            ) : (
              <View style={screenStyles.valueBox}>
                <Text style={screenStyles.value}>
                  {sex === 'female' ? '♀️ Femelle' : '♂️ Mâle'}
                </Text>
              </View>
            )}
          </View>

          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Date de naissance</Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowPicker(true)}
                  disabled={loading}
                >
                  <Text style={styles.dateButtonText}>
                    {birthDate
                      ? birthDate.toLocaleDateString('fr-FR')
                      : 'Sélectionner une date'}
                  </Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={birthDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowPicker(Platform.OS === 'ios');
                      if (selectedDate) setBirthDate(selectedDate);
                    }}
                  />
                )}
              </>
            ) : (
              <View>
                <View style={screenStyles.valueBox}>
                  <Text style={screenStyles.value}>
                    {currentDog.birth_date
                      ? new Date(currentDog.birth_date).toLocaleDateString('fr-FR')
                      : 'Non renseignée'}
                  </Text>
                </View>
                {currentDog.birth_date && (
                  <View style={styles.ageBox}>
                    <Text style={styles.ageText}>
                      {EMOJI.fire} {getDogAge(currentDog.birth_date)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {isEditing ? (
          <View style={screenStyles.buttonRow}>
            <TouchableOpacity
              style={[screenStyles.button, screenStyles.buttonPrimary]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={screenStyles.buttonPrimaryText}>
                {loading ? 'Enregistrement...' : ' Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[screenStyles.button, screenStyles.buttonSecondary]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={screenStyles.buttonSecondaryText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[screenStyles.button, screenStyles.buttonDanger]}
            onPress={handleDelete}
          >
            <Text style={screenStyles.buttonDangerText}> Supprimer le profil</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  photoAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  loadingAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.small,
  },
  cameraIcon: {
    fontSize: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    ...shadows.small,
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  form: {
    marginBottom: spacing.lg,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  dateButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.normal,
  },
  ageBox: {
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    marginTop: spacing.base,
  },
  ageText: {
    fontSize: typography.sizes.base,
    color: colors.warning,
    fontWeight: typography.weights.bold,
  },  addDogButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
  },
  addDogButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addDogButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  addDogButtonIconText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray600,
  },
  addDogButtonTextContainer: {
    flex: 1,
  },
  addDogButtonTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  addDogButtonSubtitle: {
    color: colors.gray600,
    fontSize: typography.sizes.sm,
  },});