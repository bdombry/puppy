import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, startGuestMode } = useAuth();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
  if (mode === 'signin') {
    await signInWithEmail(email, password);
  } else {
    await signUpWithEmail(email, password);
  }
} catch (error) {
  let message = 'Une erreur est survenue. Veuillez réessayer.';
  
  // Traduire les erreurs courantes Supabase
  if (error.message.includes('Invalid login credentials')) {
    message = "Email ou mot de passe incorrect";
  }
  if (error.message.includes('User already registered')) {
    message = "Cet email est déjà utilisé";
  }
  if (error.message.includes('Password should be')) {
    message = "Le mot de passe est trop faible";
  }

  Alert.alert('Erreur', message);
}

  };

  const handleSkip = async () => {
    await startGuestMode();
  };

  if (mode === 'signin' || mode === 'signup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setMode('welcome')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        
        <Text style={styles.authTitle}>
          {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleEmailAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={styles.switchMode}
        >
          <Text style={styles.switchModeText}>
            {mode === 'signin'
              ? 'Pas encore de compte ? Créer un compte'
              : 'Déjà un compte ? Se connecter'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcomeIcon}>🐕</Text>
      <Text style={styles.welcomeTitle}>Bienvenue sur PuppyTracker</Text>
      <Text style={styles.welcomeSubtitle}>
        Suivez la propreté de votre chiot et célébrez ses progrès jour après jour
      </Text>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Notez chaque sortie</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Suivez les progrès</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Célébrez les victoires</Text>
        </View>
      </View>

      <View style={styles.authButtons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() =>
            Alert.alert(
              'Google Sign In',
              'Disponible dans la version buildée de l\'app'
            )
          }
        >
          <Text style={styles.buttonIcon}>🍎</Text>
          <Text style={[styles.buttonText, styles.buttonTextDark]}>
            Continuer avec Apple
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() =>
            Alert.alert(
              'Google Sign In',
              'Disponible dans la version buildée de l\'app'
            )
          }
        >
          <Text style={styles.buttonIcon}>🔵</Text>
          <Text style={[styles.buttonText, styles.buttonTextDark]}>
            Continuer avec Google
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => setMode('signup')}
        >
          <Text style={styles.buttonIcon}>✉️</Text>
          <Text style={[styles.buttonText, styles.buttonTextOutline]}>
            Continuer avec Email
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipButtonText}>Passer pour l'instant</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('signin')} style={styles.signinLink}>
        <Text style={styles.signinLinkText}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 64,
    marginTop: 40,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    color: '#10b981',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDark: {
    color: '#111827',
  },
  buttonTextOutline: {
    color: '#6366f1',
  },
  skipButton: {
    marginTop: 24,
    padding: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  signinLink: {
    marginTop: 8,
    padding: 8,
  },
  signinLinkText: {
    fontSize: 14,
    color: '#6366f1',
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  switchMode: {
    marginTop: 16,
    padding: 8,
  },
  switchModeText: {
    fontSize: 14,
    color: '#6366f1',
    textAlign: 'center',
  },
});