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
    if (!user) throw new Error('Utilisateur non authentifié');

    try {
      const finalDogData = {
        ...dogData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('Dogs')
        .insert([finalDogData])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase saveDog:', error);
        throw new Error(error.message || 'Erreur lors de la création du chien');
      }

      setCurrentDog(data);
      return data;
    } catch (error) {
      console.error('Erreur saveDog complète:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentDog(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    if (!user?.email) throw new Error('No user email found');

    try {
      // Mettre à jour directement le mot de passe
      // Supabase va valider que l'utilisateur est authentifié
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        // Si on a une erreur "weak_password" ou autre, c'est ok
        if (updateError.message.includes('weak_password')) {
          throw new Error('Le mot de passe est trop faible. Utilise au moins 6 caractères.');
        }
        throw new Error(updateError.message || 'Impossible de changer le mot de passe');
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user?.id) throw new Error('No user logged in');

    // Sauvegarder l'ID avant de modifier l'état
    const userId = user.id;

    try {
      // 1. Récupérer tous les chiens AVANT de nettoyer l'état
      const { data: dogs, error: dogsError } = await supabase
        .from('Dogs')
        .select('id')
        .eq('user_id', userId);

      if (dogsError) {
        console.error('Error fetching dogs:', dogsError);
      }

      console.log('Found dogs:', dogs);

      // 2. Supprimer tous les outings
      if (dogs && dogs.length > 0) {
        for (const dog of dogs) {
          const { error: outingsError } = await supabase
            .from('outings')
            .delete()
            .eq('dog_id', dog.id);
          
          if (outingsError) {
            console.error('Error deleting outings:', outingsError);
          }
        }
        console.log('Deleted outings');
      }

      // 3. Supprimer tous les chiens
      const { error: deleteDogsError } = await supabase
        .from('Dogs')
        .delete()
        .eq('user_id', userId);

      if (deleteDogsError) {
        console.error('Error deleting dogs:', deleteDogsError);
      }
      console.log('Deleted dogs');

      // 4. Soft delete l'utilisateur (renommer l'email)
      const { data: rpcData, error: rpcError } = await supabase.rpc('soft_delete_user', {
        user_id: userId,
      });

      console.log('Soft delete result:', { rpcData, rpcError });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        // Afficher l'erreur pour debug
        throw new Error('RPC failed: ' + JSON.stringify(rpcError));
      }

      if (rpcData === false) {
        throw new Error('soft_delete_user returned false');
      }

      // 5. Nettoyer l'état local APRÈS les suppressions
      setCurrentDog(null);
      setUser(null);

      // 6. Se déconnecter
      await supabase.auth.signOut();

      console.log('Account fully deleted');
      return true;
    } catch (error) {
      console.error('Delete account error:', error);
      // Nettoyer et déconnecter même en cas d'erreur
      setCurrentDog(null);
      setUser(null);
      await supabase.auth.signOut();
      throw error;
    }
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
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
