import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestStartDate, setGuestStartDate] = useState(null);
  const [currentDog, setCurrentDog] = useState(undefined);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserDog(session.user.id);
      } else {
        const guestData = await AsyncStorage.getItem('guestMode');
        if (guestData) {
          const { startDate, dog } = JSON.parse(guestData);
          setIsGuestMode(true);
          setGuestStartDate(new Date(startDate));
          setCurrentDog(dog || null);
        } else {
          setCurrentDog(null);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setCurrentDog(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDog = async (userId) => {
    try {
      const { data } = await supabase
        .from('Dogs')
        .select('*')
        .eq('user_id', userId)
        .single();
      setCurrentDog(data || null);
    } catch (error) {
      setCurrentDog(null);
    }
  };

  const signInWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setUser(data.user);
      await loadUserDog(data.user.id);
      await migrateGuestData(data.user.id);

      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setUser(data.user);
      setCurrentDog(null);
      await migrateGuestData(data.user.id);

      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const migrateGuestData = async (userId) => {
    try {
      const guestData = await AsyncStorage.getItem('guestMode');
      if (guestData) {
        const { dog } = JSON.parse(guestData);
        if (dog) {
          const { data } = await supabase
            .from('Dogs')
            .insert([{ ...dog, user_id: userId }])
            .select()
            .single();
          setCurrentDog(data);
        }
        await AsyncStorage.removeItem('guestMode');
        setIsGuestMode(false);
      }
    } catch (error) {
      console.error('Error migrating guest data:', error);
    }
  };

  const startGuestMode = async () => {
    const guestData = { startDate: new Date().toISOString(), dog: null };
    await AsyncStorage.setItem('guestMode', JSON.stringify(guestData));
    setIsGuestMode(true);
    setGuestStartDate(new Date());
    setCurrentDog(null);
  };

  const saveDog = async (dogData) => {
    if (isGuestMode) {
      const guestData = await AsyncStorage.getItem('guestMode');
      const parsed = JSON.parse(guestData);
      parsed.dog = dogData;
      await AsyncStorage.setItem('guestMode', JSON.stringify(parsed));
      setCurrentDog(dogData);
    } else if (user) {
      const { data, error } = await supabase
        .from('Dogs')
        .insert([{ ...dogData, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setCurrentDog(data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('guestMode');
    setUser(null);
    setIsGuestMode(false);
    setCurrentDog(null);
  };

  const getDaysInGuestMode = () => {
    if (!guestStartDate) return 0;
    const now = new Date();
    const diff = now - guestStartDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuestMode,
        currentDog,
        setCurrentDog,
        guestStartDate,
        getDaysInGuestMode,
        signInWithEmail,
        signUpWithEmail,
        startGuestMode,
        saveDog,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
