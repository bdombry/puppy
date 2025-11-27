import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { onboardingStyles } from '../../styles/onboardingStyles';
import OnboardingHeader from '../OnboardingHeader';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import BackButton from '../BackButton';
import { EMOJI } from '../../constants/config';

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
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await startGuestMode();
  };

  if (mode === 'signin' || mode === 'signup') {
    return (
      <ScrollView
        style={onboardingStyles.container}
        contentContainerStyle={onboardingStyles.scrollContent}
        scrollEnabled={false}
      >
        <BackButton onPress={() => setMode('welcome')} />
        
        <OnboardingHeader
          title={mode === 'signin' ? 'Connexion' : 'Créer un compte'}
          subtitle={mode === 'signin' ? 'Connectez-vous à votre compte' : 'Créez un nouveau compte'}
        />
        
        <View style={onboardingStyles.form}>
          <FormInput
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <FormInput
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>
        
        <View style={onboardingStyles.buttonContainer}>
          <AuthButton
            type="primary"
            label={mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
            onPress={handleEmailAuth}
            loading={loading}
          />
          
          <AuthButton
            type="outline"
            label={mode === 'signin' ? "Créer un compte" : 'Retour'}
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={onboardingStyles.container}
      contentContainerStyle={onboardingStyles.scrollContent}
      scrollEnabled={false}
    >
      <OnboardingHeader
        icon={EMOJI.dog}
        title="Bienvenue sur PuppyTracker"
        subtitle="Suivez la propreté de votre chiot et célébrez ses progrès jour après jour"
      />

      <View style={onboardingStyles.features}>
        <View style={onboardingStyles.feature}>
          <Text style={onboardingStyles.featureIcon}>✓</Text>
          <Text style={onboardingStyles.featureText}>Notez chaque sortie</Text>
        </View>
        <View style={onboardingStyles.feature}>
          <Text style={onboardingStyles.featureIcon}>✓</Text>
          <Text style={onboardingStyles.featureText}>Suivez les progrès</Text>
        </View>
        <View style={onboardingStyles.feature}>
          <Text style={onboardingStyles.featureIcon}>✓</Text>
          <Text style={onboardingStyles.featureText}>Célébrez les victoires</Text>
        </View>
      </View>

      <View style={onboardingStyles.buttonContainer}>
        <AuthButton
          type="secondary"
          label="Continuer avec Apple"
          icon={EMOJI.apple}
          onPress={() =>
            Alert.alert(
              'Apple Sign In',
              'Disponible dans la version buildée de l\'app'
            )
          }
        />
        
        <AuthButton
          type="secondary"
          label="Continuer avec Google"
          icon={EMOJI.google}
          onPress={() =>
            Alert.alert(
              'Google Sign In',
              'Disponible dans la version buildée de l\'app'
            )
          }
        />
        
        <AuthButton
          type="outline"
          label="Continuer avec Email"
          icon={EMOJI.email}
          onPress={() => setMode('signup')}
        />
      </View>

      <AuthButton
        type="link"
        label="Passer pour l'instant"
        onPress={handleSkip}
      />

      <AuthButton
        type="link"
        label="Déjà un compte ? Se connecter"
        onPress={() => setMode('signin')}
      />
    </ScrollView>
  );
}

AuthScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};