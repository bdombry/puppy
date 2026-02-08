import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';

const OnboardingNScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.base, marginBottom: spacing.md }}>
        <OnboardingProgressBar current={N} total={7} />
      </View>

      <OnboardingNavigation
        onPrev={() => navigation.navigate('OnboardingN-1')}
        onNext={() => navigation.navigate('OnboardingN+1')}
        showPrev={true}
        showNext={true}
        disablePrev={false}
        disableNext={false}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}>
        <Text>Onboarding N - À remplir</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingNScreen;
