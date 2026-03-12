import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { useAuth } from '../../context/AuthContext';

const DogBirthdateScreen = ({ navigation, route }) => {
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const dogData = route?.params?.dogData || {};
  const { saveDog } = useAuth();

  const handleSave = async () => {
    if (!birthDate) {
      Alert.alert('Erreur', 'La date de naissance est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const completeData = {
        name: dogData.name,
        breed: dogData.breed,
        sex: dogData.sex,
  // FICHIER SUPPRIMÉ : DogBirthdateScreen n'est plus utilisé
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DogBirthdateScreen;
