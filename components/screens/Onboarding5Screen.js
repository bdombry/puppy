import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../constants/theme';

const Onboarding5Screen = ({ navigation, route }) => {
  const [date, setDate] = useState(new Date(2023, 0, 1));
  const dogData = route?.params?.dogData || {};

  const handleContinue = () => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const birthDate = `${year}-${month}-${day}`;
    navigation.navigate('Onboarding6', {
      dogData: { ...dogData, birthDate },
      onDogDataSelected: route.params?.onDogDataSelected,
    });
  };

  const formatDate = (d) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#007AFF' }}>← Retour</Text>
        </TouchableOpacity>

        {/* Titre */}
        <Text style={{ fontSize: 34, fontWeight: '700', color: '#000', marginBottom: spacing.xs, letterSpacing: -0.5 }}>
          Date de
        </Text>
        <Text style={{ fontSize: 34, fontWeight: '700', color: '#007AFF', marginBottom: spacing.lg, letterSpacing: -0.5 }}>
          naissance ?
        </Text>

        {/* Date affichée */}
        <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, marginBottom: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: spacing.sm }}>
            Date sélectionnée
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#007AFF', letterSpacing: 0.5 }}>
            {formatDate(date)}
          </Text>
        </View>

        {/* Native Date Picker */}
        <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' }}>
          <DateTimePicker
            value={date}
            onChange={(event, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            textColor="#000"
            maximumDate={new Date()}
            minimumDate={new Date(1980, 0, 1)}
          />
        </View>
      </View>

      {/* Bouton */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <TouchableOpacity
          onPress={handleContinue}
          style={{ paddingVertical: spacing.md, borderRadius: 10, backgroundColor: '#007AFF', alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding5Screen;




