// global.js
import { StyleSheet, Platform, StatusBar } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  pageMarginTop: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 60, 
    // +8 pour un petit padding supplémentaire sur Android
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 32,
    alignItems: 'center',
    width: '90%',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
