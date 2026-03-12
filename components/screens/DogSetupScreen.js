import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';
import FormInput from '../FormInput';

// FICHIER SUPPRIMÉ : DogSetupScreen n'est plus utilisé