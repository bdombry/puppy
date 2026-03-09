import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

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
      userProblems: route.params?.userProblems || [],
      onDogDataSelected: route.params?.onDogDataSelected,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: spacing.md }}>
        <BackButton onPress={() => navigation.navigate('Onboarding2')} />
        <OnboardingProgressBar percent={60} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Titre */}
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: colors.black,
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
            color: colors.primary,
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
            backgroundColor: colors.pupyBackground,
            borderWidth: 2,
            borderColor: colors.pupyBorderLight,
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.black, marginBottom: spacing.sm }}>
            Nom
          </Text>
          <TextInput
            placeholder="Entrez le nom"
            placeholderTextColor={colors.textTertiary}
            value={dogName}
            onChangeText={setDogName}
            style={{
              backgroundColor: colors.pupyBackground,
              borderRadius: 10,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: colors.black,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.pupyBorder,
            }}
          />
        </View>

        {/* Sexe */}
        <View style={{ marginBottom: spacing.xxl }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.black, marginBottom: spacing.md }}>
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
                  backgroundColor: sex === s ? colors.primary : colors.pupyBackground,
                  borderWidth: 1,
                  borderColor: sex === s ? colors.primary : colors.pupyBorder,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: sex === s ? colors.pureWhite : colors.black,
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
      </KeyboardAvoidingView>

      {/* Bouton */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canProceed}
          style={{
            paddingVertical: spacing.md,
            borderRadius: 10,
            backgroundColor: canProceed ? colors.primary : colors.disabled,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.pureWhite, fontWeight: '600', fontSize: 16 }}>
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding3Screen;
