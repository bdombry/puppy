import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert, Share } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { generateInviteLink } from './services/collaboratorService';

/**
 * Bouton simple pour partager le chien
 */
export const ShareDogButton = ({ dogId, userId, dogName = 'Ton chien' }) => {
  const [loading, setLoading] = React.useState(false);

  const handleShareDog = async () => {
    setLoading(true);
    try {
      const result = await generateInviteLink(dogId, userId);
      if (result.success) {
        await Share.share({
          message: `🐕 Viens partager ${dogName} avec moi sur PupyTracker!\n\n${result.invitationUrl}\n\n* Ce lien expire dans 7 jours et ne peut être utilisé qu'une seule fois.`,
          title: `Partage ${dogName}`,
        });
      } else {
        Alert.alert('Erreur', result.error?.message || 'Erreur lors du partage');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Quelque chose s\'est mal passé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
      }}
      onPress={handleShareDog}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            Partager {dogName}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default ShareDogButton;
