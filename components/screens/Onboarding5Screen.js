import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

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
      userProblems: route.params?.userProblems || [],
      onDogDataSelected: route.params?.onDogDataSelected,
    });
  };

  const formatDate = (d) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={68} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>

        {/* Titre */}
        <Text style={{ fontSize: 34, fontWeight: '700', color: colors.black, marginBottom: spacing.xs, letterSpacing: -0.5 }}>
          Date de
        </Text>
        <Text style={{ fontSize: 34, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg, letterSpacing: -0.5 }}>
          naissance ?
        </Text>

        {/* Date affichée */}
        <View style={{ backgroundColor: colors.pupyBackground, borderRadius: 12, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, marginBottom: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.pupyBorder }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm }}>
            Date sélectionnée
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 }}>
            {formatDate(date)}
          </Text>
        </View>

        {/* Native Date Picker */}
        <View style={{ backgroundColor: colors.pupyBackground, borderRadius: 12, borderWidth: 1, borderColor: colors.pupyBorder, overflow: 'hidden' }}>
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
          style={{ paddingVertical: spacing.md, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' }}
        >
          <Text style={{ color: colors.pureWhite, fontWeight: '600', fontSize: 16 }}>
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding5Screen;




