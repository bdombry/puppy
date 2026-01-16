import { supabase } from '../../config/supabase';

/**
 * Générer un lien d'invitation pour partager un chien
 */
export const generateInviteLink = async (dogId, userId) => {
  try {
    const { data, error } = await supabase
      .from('dog_collaborators')
      .insert({
        dog_id: dogId,
        created_by: userId,
        status: 'pending',
      })
      .select('invitation_token, invitation_expires_at')
      .single();

    if (error) throw error;

    const invitationUrl = `pupytracker://invite/${data.invitation_token}`;
    
    return {
      success: true,
      token: data.invitation_token,
      invitationUrl,
      expiresAt: data.invitation_expires_at,
    };
  } catch (error) {
    console.error('❌ generateInviteLink error:', error);
    return { success: false, error };
  }
};

/**
 * Accepter une invitation et devenir collaborateur
 */
export const acceptInvitation = async (invitationToken, userId) => {
  try {
    // Chercher l'invitation en attente
    const { data: invite, error: fetchError } = await supabase
      .from('dog_collaborators')
      .select('id, dog_id, status, invitation_expires_at, Dogs(name)')
      .eq('invitation_token', invitationToken)
      .single();

    if (fetchError || !invite) {
      return { success: false, error: 'Invitation non trouvée' };
    }

    // Vérifier le statut
    if (invite.status === 'accepted') {
      return { success: false, error: 'Cette invitation a déjà été utilisée' };
    }

    // Vérifier expiration
    const expiresAt = new Date(invite.invitation_expires_at);
    if (expiresAt < new Date()) {
      return { success: false, error: 'Cette invitation a expiré' };
    }

    // Vérifier que l'user n'est pas déjà collaborateur
    const { data: existing } = await supabase
      .from('dog_collaborators')
      .select('id')
      .eq('dog_id', invite.dog_id)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .single();

    if (existing) {
      return { success: false, error: 'Vous êtes déjà collaborateur pour ce chien' };
    }

    // Accepter l'invitation
    const { error: updateError } = await supabase
      .from('dog_collaborators')
      .update({
        user_id: userId,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('invitation_token', invitationToken);

    if (updateError) throw updateError;

    console.log('✅ Invitation acceptée!');

    return {
      success: true,
      dogId: invite.dog_id,
      dogName: invite.Dogs?.name || 'Chien inconnu',
    };
  } catch (error) {
    console.error('❌ acceptInvitation error:', error);
    return { success: false, error };
  }
};

/**
 * Récupérer les collaborateurs d'un chien
 */
export const getCollaborators = async (dogId, userId) => {
  try {
    // Vérifier que c'est l'owner
    const { data: dog, error: dogError } = await supabase
      .from('Dogs')
      .select('user_id')
      .eq('id', dogId)
      .single();

    if (dogError || dog?.user_id !== userId) {
      return { success: false, error: 'Vous n\'êtes pas le propriétaire' };
    }

    // Récupérer les collaborateurs
    const { data: collaborators, error } = await supabase
      .from('dog_collaborators')
      .select('id, user_id, status, created_at, accepted_at')
      .eq('dog_id', dogId)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false });

    if (error) throw error;

    return { success: true, collaborators };
  } catch (error) {
    console.error('❌ getCollaborators error:', error);
    return { success: false, error };
  }
};

/**
 * Supprimer un collaborateur
 */
export const removeCollaborator = async (dogId, collaboratorId, userId) => {
  try {
    // Vérifier que c'est l'owner
    const { data: dog, error: dogError } = await supabase
      .from('Dogs')
      .select('user_id')
      .eq('id', dogId)
      .single();

    if (dogError || dog?.user_id !== userId) {
      return { success: false, error: 'Vous n\'êtes pas le propriétaire' };
    }

    // Supprimer le collaborateur
    const { error } = await supabase
      .from('dog_collaborators')
      .delete()
      .eq('dog_id', dogId)
      .eq('user_id', collaboratorId)
      .eq('status', 'accepted');

    if (error) throw error;

    console.log('✅ Collaborateur supprimé');
    return { success: true };
  } catch (error) {
    console.error('❌ removeCollaborator error:', error);
    return { success: false, error };
  }
};

/**
 * Vérifier si un utilisateur est collaborateur
 */
export const isCollaborator = async (dogId, userId) => {
  try {
    // Vérifier si owner
    const { data: dog } = await supabase
      .from('Dogs')
      .select('user_id')
      .eq('id', dogId)
      .single();

    if (dog?.user_id === userId) return true;

    // Vérifier si collaborateur accepté
    const { data: collaborator } = await supabase
      .from('dog_collaborators')
      .select('id')
      .eq('dog_id', dogId)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .single();

    return !!collaborator;
  } catch (error) {
    console.error('❌ isCollaborator error:', error);
    return false;
  }
};
