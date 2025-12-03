/**
 * Service pour les notifications alimentation/hydratation
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Presets selon l'âge (en minutes)
export const FEEDING_PRESETS = {
  'young': { label: '🐶 2-3 mois', eat: 15, drink: 15 },      // 15 min
  'medium': { label: '🐕 4-6 mois', eat: 20, drink: 20 },     // 20 min
  'older': { label: '🐕‍🦺 6+ mois', eat: 30, drink: 30 },     // 30 min
  'custom': { label: '✏️ Personnalisé', eat: 0, drink: 0 },   // À configurer
};

const STORAGE_KEY_FEEDING = 'feedingSettings';
const STORAGE_KEY_LAST_EATING = 'lastEatingTime';
const STORAGE_KEY_LAST_DRINKING = 'lastDrinkingTime';

export const DEFAULT_FEEDING_SETTINGS = {
  preset: 'medium',
  customEatMinutes: 20,
  customDrinkMinutes: 20,
};

/**
 * Sauvegarde les paramètres alimentation
 */
export const saveFeedingSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_FEEDING, JSON.stringify(settings));
    console.log('💾 Paramètres alimentation sauvegardés');
    return true;
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
};

/**
 * Charge les paramètres alimentation
 */
export const loadFeedingSettings = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_FEEDING);
    return saved ? JSON.parse(saved) : DEFAULT_FEEDING_SETTINGS;
  } catch (error) {
    console.error('Load error:', error);
    return DEFAULT_FEEDING_SETTINGS;
  }
};

/**
 * Récupère le dernier timestamp manger
 */
export const getLastEatingTime = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_LAST_EATING);
    return saved ? new Date(JSON.parse(saved)) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Récupère le dernier timestamp boire
 */
export const getLastDrinkingTime = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_LAST_DRINKING);
    return saved ? new Date(JSON.parse(saved)) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Programme une notification après alimentation
 * Groupe automatiquement manger + boire si dans les 5 minutes
 * @param {string} type - 'eat' ou 'drink'
 * @param {Date} lastTime - Heure du dernier repas/boisson
 * @param {string} dogName - Nom du chien
 */
export const scheduleFeedingNotification = async (type, lastTime, dogName) => {
  try {
    const settings = await loadFeedingSettings();
    
    // Déterminer les minutes d'attente
    let minutesToWait;
    if (settings.preset === 'custom') {
      minutesToWait = type === 'eat' ? settings.customEatMinutes : settings.customDrinkMinutes;
    } else {
      const preset = FEEDING_PRESETS[settings.preset];
      minutesToWait = type === 'eat' ? preset.eat : preset.drink;
    }

    // ⚠️ IMPORTANT: Sauvegarder le timestamp EN PREMIER pour que la prochaine appel le voie
    const storageKey = type === 'eat' ? STORAGE_KEY_LAST_EATING : STORAGE_KEY_LAST_DRINKING;
    await AsyncStorage.setItem(storageKey, JSON.stringify(lastTime.toISOString()));

    // Vérifier si l'autre type a été enregistré dans les 5 dernières minutes
    const otherType = type === 'eat' ? 'drink' : 'eat';
    const otherTime = type === 'eat' ? await getLastDrinkingTime() : await getLastEatingTime();
    const timeDiffMs = otherTime ? Math.abs(lastTime - otherTime) : Infinity;
    const timeDiffMinutes = timeDiffMs / 60000;
    
    const shouldGroup = otherTime && timeDiffMinutes <= 5;

    // Supprimer les anciennes notifs
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier === `feeding-${type}` || 
          (shouldGroup && notif.identifier === `feeding-${otherType}`) ||
          (shouldGroup && notif.identifier === 'feeding-grouped')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // Programmer la nouvelle notif
    let content;
    let identifier;
    
    if (shouldGroup) {
      // Grouper: manger ET boire
      const maxMinutes = Math.max(minutesToWait, 
        type === 'eat' 
          ? (settings.preset === 'custom' ? settings.customDrinkMinutes : FEEDING_PRESETS[settings.preset].drink)
          : (settings.preset === 'custom' ? settings.customEatMinutes : FEEDING_PRESETS[settings.preset].eat)
      );
      
      content = {
        title: `${dogName} 🐶`,
        body: `A mangé ET bu ya ${maxMinutes}min ⏰ Attention, faut le sortir !`,
        sound: 'default',
      };
      identifier = 'feeding-grouped';
      minutesToWait = maxMinutes;
    } else {
      // Notif simple
      content = {
        title: `${dogName} 🐶`,
        body: type === 'eat' 
          ? `A mangé ya ${minutesToWait}min ⏰ Attention, faut le sortir !`
          : `A bu ya ${minutesToWait}min 💧 Attention, faut le sortir !`,
        sound: 'default',
      };
      identifier = `feeding-${type}`;
    }

    const secondsToWait = minutesToWait * 60;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content,
      trigger: {
        seconds: secondsToWait,
        repeats: false,
      },
    });

    const message = shouldGroup 
      ? `✅ Notif groupée (manger + boire) dans ${minutesToWait}min`
      : `✅ Notif ${type} programmée dans ${minutesToWait}min`;
    console.log(message);
    return true;
  } catch (error) {
    console.error('Schedule error:', error);
    return false;
  }
};

/**
 * Obtient les minutes jusqu'à la prochaine notification
 */
export const getMinutesUntilNotification = async (type) => {
  try {
    const lastTime = type === 'eat' 
      ? await getLastEatingTime() 
      : await getLastDrinkingTime();
    
    if (!lastTime) return null;

    const settings = await loadFeedingSettings();
    let minutesToWait;
    
    if (settings.preset === 'custom') {
      minutesToWait = type === 'eat' ? settings.customEatMinutes : settings.customDrinkMinutes;
    } else {
      const preset = FEEDING_PRESETS[settings.preset];
      minutesToWait = type === 'eat' ? preset.eat : preset.drink;
    }

    const now = new Date();
    const notificationTime = new Date(lastTime.getTime() + minutesToWait * 60 * 1000);
    const diffMs = notificationTime - now;
    
    if (diffMs <= 0) return 0;
    
    return Math.ceil(diffMs / 60000); // Retourner en minutes
  } catch (error) {
    return null;
  }
};
