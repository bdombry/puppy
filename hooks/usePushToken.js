import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export const usePushToken = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const getPushToken = async () => {
      try {
        // Vérifie les permissions
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          console.log('⚠️ Permission de notifications refusée');
          return;
        }

        // Récupère le token Expo
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('📱 Expo Push Token:', token.data);

        // Sauvegarde dans Supabase
        const deviceId = Platform.OS === 'ios' ? 'ios-device' : 'android-device';
        
        const { error } = await supabase
          .from('push_tokens')
          .upsert({
            user_id: user.id,
            token: token.data,
            device_id: deviceId,
            platform: Platform.OS,
          }, {
            onConflict: 'user_id,device_id'
          });

        if (error) {
          console.error('❌ Erreur sauvegarde token:', error);
        } else {
          console.log('✅ Token sauvegardé dans Supabase');
        }
      } catch (error) {
        console.error('❌ Erreur récupération token:', error);
      }
    };

    getPushToken();
  }, [user]);
};
