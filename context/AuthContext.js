import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

// Clés pour AsyncStorage
const LAST_DOG_KEY = '@last_selected_dog';

// Fonctions utilitaires pour AsyncStorage
const saveLastDogId = async (dogId) => {
  try {
    console.log('💾 Sauvegarde dernier chien ID:', dogId, '(type:', typeof dogId, ')');
    await AsyncStorage.setItem(LAST_DOG_KEY, dogId.toString());
  } catch (error) {
    console.error('Erreur sauvegarde dernier chien:', error);
  }
};

const getLastDogId = async () => {
  try {
    const dogId = await AsyncStorage.getItem(LAST_DOG_KEY);
    console.log('📖 Récupération dernier chien ID depuis storage:', dogId);
    return dogId; // Retourner tel quel, peut être string ou null
  } catch (error) {
    console.error('Erreur récupération dernier chien:', error);
    return null;
  }
};

const clearLastDogId = async () => {
  try {
    await AsyncStorage.removeItem(LAST_DOG_KEY);
  } catch (error) {
    console.error('Erreur suppression dernier chien:', error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDog, setCurrentDog] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dogsLoading, setDogsLoading] = useState(false);

  // ✅ CORRIGER la race condition: utiliser un flag pour initialiser une fois
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // ✅ Étape 1: Vérifier la session avec timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadUserDog(session.user.id);
        } else {
          setUser(null);
          setCurrentDog(null);
        }
      } catch (error) {
        console.error('❌ Erreur AuthProvider init:', error);
        if (isMounted) {
          // En cas d'erreur, on considère qu'il n'y a pas de session
          setUser(null);
          setCurrentDog(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Initialiser une seule fois au montage
    if (!isInitialized) {
      initAuth();
    }

    // ✅ Étape 2: Écouter les changements d'auth APRÈS initialisation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // ✅ Ignorer INITIAL_SESSION - déjà géré par initAuth() ci-dessus
        // Cela évite un double appel à loadUserDog() au démarrage
        if (event === 'INITIAL_SESSION') return;

        if (session?.user) {
          // ✅ Set dogsLoading BEFORE setUser so they batch in the same render
          // This prevents a navigation gap where user is set but currentDog is null
          setDogsLoading(true);
          setUser(session.user);
          try {
            await loadUserDog(session.user.id);
          } finally {
            if (isMounted) setDogsLoading(false);
          }
        } else {
          setUser(null);
          setCurrentDog(null);
          setDogsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [isInitialized]);

  const loadUserDog = async (userId, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;

    try {
      // 1️⃣ Chiens que l'utilisateur possède
      const { data: ownedDogs, error: ownedError } = await supabase
        .from('Dogs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (ownedError) {
        console.error('Erreur chargement chiens possédés:', ownedError);
        setDogs([]);
        setCurrentDog(null);
        return;
      }
      
      // 2️⃣ Chiens partagés avec l'utilisateur (via dog_collaborators)
      const { data: sharedDogIds, error: collaboratorError } = await supabase
        .from('dog_collaborators')
        .select('dog_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');
      
      if (collaboratorError) {
        console.error('Erreur chargement chiens collaborateurs:', collaboratorError);
      }
      
      // 3️⃣ Récupérer les détails des chiens partagés
      let sharedDogs = [];
      if (sharedDogIds && sharedDogIds.length > 0) {
        const dogIds = sharedDogIds.map(d => d.dog_id);
        const { data: shared, error: sharedError } = await supabase
          .from('Dogs')
          .select('*')
          .in('id', dogIds)
          .order('created_at', { ascending: false });
        
        if (sharedError) {
          console.error('Erreur chargement détails chiens partagés:', sharedError);
        } else {
          sharedDogs = shared || [];
        }
      }
      
      // 4️⃣ Fusionner les listes (chiens possédés + chiens partagés)
      const allDogs = [...(ownedDogs || []), ...sharedDogs];
      
      setDogs(allDogs);
      
      console.log('🐕 Chiens chargés (possédés + partagés):', allDogs?.map(d => ({id: d.id, name: d.name})));
      
      // Récupérer le dernier chien sélectionné depuis AsyncStorage
      const lastDogId = await getLastDogId();
      let selectedDog = null;
      
      if (lastDogId && allDogs) {
        // Chercher le chien avec cet ID (comparaison flexible string/number)
        selectedDog = allDogs.find(dog => dog.id == lastDogId);
        console.log('🔍 Chien trouvé avec ID', lastDogId, '(type:', typeof lastDogId, ') chien ID type:', typeof selectedDog?.id, ':', selectedDog);
      }
      
      // Si pas trouvé ou pas de dernier chien, prendre le premier (plus récent)
      if (!selectedDog && allDogs && allDogs.length > 0) {
        selectedDog = allDogs[0];
        console.log('⚠️ Aucun chien sauvegardé trouvé, utilisation du premier:', selectedDog.name);
      }
      
      console.log('✅ Chien actuel défini:', selectedDog?.name);
      setCurrentDog(selectedDog);
      
      // Si aucun chien trouvé et qu'on peut encore réessayer
      // (race condition: le chien est en cours de création après signup)
      if (!selectedDog && retryCount < MAX_RETRIES) {
        console.log(`⏳ Aucun chien trouvé, retry ${retryCount + 1}/${MAX_RETRIES} dans ${RETRY_DELAY}ms...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        return loadUserDog(userId, retryCount + 1);
      }
      
      // Sauvegarder le chien actuel pour les futures sessions
      if (selectedDog?.id) {
        await saveLastDogId(selectedDog.id);
      }
    } catch (error) {
      console.error('Erreur loadUserDog:', error);
      setDogs([]);
      setCurrentDog(null);
    }
  };

  const setCurrentDogWithPersistence = async (dog) => {
    console.log('🔄 Changement de chien vers:', dog?.name, '(ID:', dog?.id, ')');
    
    // ✅ Vider le cache du chien précédent pour forcer la recharge des données
    if (currentDog?.id && currentDog?.id !== dog?.id) {
      console.log('🗑️ Vidage du cache pour chien:', currentDog.id);
      // On va laisser le hook se recharger naturellement en fonction du changement de dogId
      // (pas besoin de vider le cache manuellement ici)
    }
    
    setCurrentDog(dog);
    if (dog?.id) {
      await saveLastDogId(dog.id);
    }
  };

  const signInWithEmail = async (email, password) => {
    // ⚠️ NE PAS setLoading(true) ici !
    // Le loading du contexte contrôle le navigator dans App.js.
    // Si on met loading=true, ça démonte AuthScreen en plein login → crash.
    // Le onAuthStateChange va gérer la transition via dogsLoading + setUser.
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // ✅ NE PAS appeler loadUserDog() ici - le listener onAuthStateChange s'en charge!
      // Cela évite les appels en double et les race conditions sur AsyncStorage
      return data.user;
    } catch (error) {
      // ✅ Relancer l'erreur pour que le screen puisse la catcher
      throw error;
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
    } catch (error) {
      // ✅ Relancer l'erreur pour que le screen puisse la catcher
      throw error;
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
      // Ajouter le nouveau chien à la liste
      setDogs(prevDogs => [data, ...prevDogs]);
      return data;
    } catch (error) {
      console.error('Erreur saveDog complète:', error);
      throw error;
    }
  };

  const deleteDog = async (dogId) => {
    try {
      // Supprimer les outings du chien
      const { error: outingsError } = await supabase
        .from('outings')
        .delete()
        .eq('dog_id', dogId);

      if (outingsError) {
        console.error('Erreur suppression outings:', outingsError);
        throw outingsError;
      }

      // Supprimer le chien
      const { error: dogError } = await supabase
        .from('Dogs')
        .delete()
        .eq('id', dogId);

      if (dogError) {
        console.error('Erreur suppression chien:', dogError);
        throw dogError;
      }

      // ✅ Mettre à jour l'état: enlever le chien de la liste
      const updatedDogs = dogs.filter(dog => dog.id !== dogId);
      setDogs(updatedDogs);

      // ✅ Si c'est le chien actuel qui est supprimé
      if (currentDog?.id === dogId) {
        if (updatedDogs.length > 0) {
          // Sélectionner le premier chien restant
          setCurrentDog(updatedDogs[0]);
          await saveLastDogId(updatedDogs[0].id);
        } else {
          // Aucun chien restant
          setCurrentDog(null);
          await clearLastDogId();
        }
      }

      console.log('✅ Chien supprimé avec succès');
      return updatedDogs;
    } catch (error) {
      console.error('Erreur deleteDog:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentDog(null);
    setDogs([]);
    await clearLastDogId();
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
      setDogs([]);
      setUser(null);
      await clearLastDogId();

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
        dogs,
        setCurrentDog: setCurrentDogWithPersistence,
        signInWithEmail,
        signUpWithEmail,
        saveDog,
        deleteDog,
        dogsLoading,
        refreshDogs: () => user ? loadUserDog(user.id) : Promise.resolve(),
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
