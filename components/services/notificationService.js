/**
 * Service de notifications intelligentes
 * Basé sur l'heure de la dernière sortie + intervalle du preset
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Presets d'intervalle selon l'âge du chiot
export const PUPPY_PRESETS = {
  'young': { label: '🐶 2-3 mois', interval: 2 },      // 2h
  'medium': { label: '🐕 4-6 mois', interval: 3 },     // 3h
  'older': { label: '🐕‍🦺 6+ mois', interval: 4 },     // 4h
};

// Paramètres par défaut
export const DEFAULT_NOTIFICATION_SETTINGS = {
  preset: 'medium',
  excludedRanges: [{ start: '00:00', end: '08:00' }], // Pas de notif la nuit
};

const STORAGE_KEY = 'notificationSettings';

export const configureNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

/**
 * Sauvegarde les paramètres de notification
 */
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    console.log('💾 Paramètres notif sauvegardés');
    return true;
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
};

/**
 * Charge les paramètres de notification
 */
export const loadNotificationSettings = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('Load error:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

/**
 * Convertir "HH:MM" en minutes depuis minuit
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Vérifier si une heure est dans une plage d'exclusion
 */
const isInExcludedRange = (hour, minute, excludedRanges) => {
  const currentMinutes = hour * 60 + minute;

  for (const range of excludedRanges) {
    const startMinutes = timeToMinutes(range.start);
    const endMinutes = timeToMinutes(range.end);

    // Cas normal: 08:00 - 12:00
    if (startMinutes < endMinutes) {
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return true;
      }
    }
    // Cas la nuit: 22:00 - 08:00 (passe minuit)
    else {
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Trouver la prochaine heure valide après une plage d'exclusion
 */
const getNextValidTime = (date, excludedRanges) => {
  let currentDate = new Date(date);
  let attempts = 0;

  while (attempts < 1440) { // Max 24h
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();

    if (!isInExcludedRange(hour, minute, excludedRanges)) {
      return currentDate;
    }

    // Ajouter 1 minute et réessayer
    currentDate.setMinutes(currentDate.getMinutes() + 1);
    attempts++;
  }

  return currentDate;
};

/**
 * Programme une notification après une sortie
 * @param {Date} lastOutingTime - Heure de la dernière sortie
 * @param {string} dogName - Nom du chien
 */
export const scheduleNotificationFromOuting = async (lastOutingTime, dogName) => {
  try {
    // Charger les paramètres
    const settings = await loadNotificationSettings();
    const preset = PUPPY_PRESETS[settings.preset];

    if (!preset) {
      console.error('Preset invalide:', settings.preset);
      return false;
    }

    // Supprimer les anciennes notifs
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier === 'outing-reminder') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // Calculer la prochaine notif: dernière sortie + intervalle
    const nextNotifTime = new Date(lastOutingTime);
    // Mode normal: + intervalle du preset (en heures)
    nextNotifTime.setHours(nextNotifTime.getHours() + preset.interval);

    // Vérifier les plages d'exclusion
    const validTime = getNextValidTime(nextNotifTime, settings.excludedRanges);

    // Calculer les secondes
    const now = new Date();
    const seconds = Math.floor((validTime - now) / 1000);

    if (seconds > 0) {
      await Notifications.scheduleNotificationAsync({
        identifier: 'outing-reminder',
        content: {
          title: `${dogName} 🐶`,
          body: `C'est l'heure de sortir !`,
          sound: 'default',
        },
        trigger: {
          seconds,
          repeats: false,
        },
      });

      console.log(`✅ Notif programmée dans ${Math.floor(seconds / 60)}min`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Schedule error:', error);
    return false;
  }
};

/**
 * Initialise au démarrage
 */
export const initializeNotifications = async () => {
  try {
    configureNotificationHandler();
    const hasPermission = await Promise.race([
      requestNotificationPermissions(),
      new Promise(resolve => setTimeout(() => resolve(false), 5000))
    ]);
    return hasPermission;
  } catch (error) {
    console.error('Init error:', error);
    return false;
  }
};

