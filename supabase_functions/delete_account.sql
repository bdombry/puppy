-- Fonction RPC pour "soft delete" un utilisateur
-- Renomme l'email pour désactiver le compte sans le supprimer physiquement

create or replace function soft_delete_user(user_id uuid)
returns boolean
language plpgsql
security definer set search_path = auth
as $$
declare
  deleted_email text;
begin
  -- Générer un email unique pour le compte supprimé
  deleted_email := 'deleted_' || extract(epoch from now())::bigint || '_' || left(user_id::text, 8) || '@deleted.account';

  -- Mettre à jour l'utilisateur pour le "désactiver"
  update auth.users 
  set 
    email = deleted_email,
    raw_user_meta_data = jsonb_build_object('deleted', true, 'deleted_at', now()),
    updated_at = now()
  where id = user_id;

  return found;
end;
$$;

grant execute on function soft_delete_user(uuid) to authenticated;
