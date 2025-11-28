import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDog, setCurrentDog] = useState(undefined);

  useEffect(() => {
    checkUser();
    
    // Listener pour les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserDog(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const checkUser = async () => {
    try {
      // Vérifier la session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await loadUserDog(session.user.id);
      } else {
        // Pas de session
        setCurrentDog(null);
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

      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const saveDog = async (dogData) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('Dogs')
      .insert([{ ...dogData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    setCurrentDog(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentDog(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        currentDog,
        setCurrentDog,
        signInWithEmail,
        signUpWithEmail,
        saveDog,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
