// global.js
import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from '../constants/theme';

export const GlobalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pupyBackground,
  },
  pageMarginTop: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 60, 
    // +8 pour un petit padding supplémentaire sur Android
  },
  safeAreaWithPadding: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 60,
  },
  container: {
    flex: 1,
    backgroundColor: colors.pupyBackground,
    padding: 16,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 32,
    alignItems: 'center',
    width: '90%',
  },
  buttonPrimaryText: {
    color: colors.pureWhite,
    fontSize: 18,
    fontWeight: '700',
  },
});
