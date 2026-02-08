import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { spacing } from '../../constants/theme';

const Onboarding3Screen = ({ navigation, route }) => {
  const [dogName, setDogName] = useState('');
  const [sex, setSex] = useState('');
  const [photo, setPhoto] = useState(null);

  const canProceed = dogName.trim() && sex;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès à la galerie photo nécessaire');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Onboarding4', {
      dogData: {
        name: dogName,
        sex,
        photo,
      },
      onDogDataSelected: route.params?.onDogDataSelected,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Onboarding2')}
        style={{ marginBottom: spacing.lg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#007AFF' }}>← Retour</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
        }}
      >
        {/* Titre */}
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: '#000',
            marginBottom: spacing.xs,
            letterSpacing: -0.5,
          }}
        >
          Qui est votre
        </Text>
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: '#007AFF',
            marginBottom: spacing.xxl,
            letterSpacing: -0.5,
          }}
        >
          chiot ?
        </Text>

        {/* Photo */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: '#f5f5f5',
            borderWidth: 2,
            borderColor: '#e8e8e8',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginBottom: spacing.xxl,
            overflow: 'hidden',
          }}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ fontSize: 48 }}>📸</Text>
          )}
        </TouchableOpacity>

        {/* Nom */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', marginBottom: spacing.sm }}>
            Nom
          </Text>
          <TextInput
            placeholder="Entrez le nom"
            placeholderTextColor="#999"
            value={dogName}
            onChangeText={setDogName}
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 10,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: '#000',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
          />
        </View>

        {/* Sexe */}
        <View style={{ marginBottom: spacing.xxl }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', marginBottom: spacing.md }}>
            Sexe
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {['Mâle', 'Femelle'].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSex(s)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: 10,
                  backgroundColor: sex === s ? '#007AFF' : '#f5f5f5',
                  borderWidth: 1,
                  borderColor: sex === s ? '#007AFF' : '#e0e0e0',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: sex === s ? '#fff' : '#000',
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bouton */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canProceed}
          style={{
            paddingVertical: spacing.md,
            borderRadius: 10,
            backgroundColor: canProceed ? '#007AFF' : '#d0d0d0',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding3Screen;
