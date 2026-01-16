import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { acceptInvitation } from '../services/collaboratorService';
import { useAuth } from '../../context/AuthContext';

/**
 * Écran pour accepter une invitation de partage de chien
 */
export const AcceptInvitationScreen = ({ route, navigation }) => {
  const { token } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien d\'invitation invalide');
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token || !user?.id) {
      Alert.alert('Erreur', 'Information manquante');
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvitation(token, user.id);

      if (result.success) {
        setInviteData({
          dogName: result.dogName,
          dogId: result.dogId,
        });
        setAccepted(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDog = () => {
    if (inviteData?.dogId) {
      navigation.navigate('DogProfile', { dogId: inviteData.dogId });
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Veuillez d'abord vous connecter</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.buttonText}>Aller à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (accepted) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.successContainer}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#34C759" />
        </View>

        <Text style={styles.successTitle}>
          <Text>Bienvenue! </Text>
          <Text>🎉</Text>
        </Text>

        <Text style={styles.successMessage}>
          Vous êtes maintenant collaborateur pour <Text style={styles.dogName}>{inviteData?.dogName}</Text>!
        </Text>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            Vous pouvez maintenant voir et tracker toutes les activités de ce chien. Aidez à suivre ses promenades, repas et besoins!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoToDog}>
            <MaterialCommunityIcons name="dog" size={20} color="#fff" />
            <Text style={styles.buttonText}>Voir {inviteData?.dogName}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
            <MaterialCommunityIcons name="home" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <MaterialCommunityIcons name="alert-circle" size={80} color="#FF3B30" />
        </View>

        <Text style={styles.errorTitle}>Invitation invalide</Text>
        <Text style={styles.errorMessage}>{error}</Text>

        <TouchableOpacity style={styles.button} onPress={handleGoHome}>
          <Text style={styles.buttonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inviteContainer}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="paw" size={60} color="#007AFF" />
      </View>

      <Text style={styles.title}>
        <Text>Vous avez été invité! </Text>
        <Text>🐕</Text>
      </Text>

      <Text style={styles.description}>
        Quelqu'un veut partager son chien avec vous sur PupyTracker. Acceptez cette invitation pour commencer à tracker ensemble!
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAcceptInvitation}
        disabled={loading || !token}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
            <Text style={styles.buttonText}>Accepter l'invitation</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={handleGoHome} disabled={loading}>
        <Text style={styles.cancelButtonText}>Plus tard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inviteContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  successContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  errorContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  dogName: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 24,
  },
};

export default AcceptInvitationScreen;
