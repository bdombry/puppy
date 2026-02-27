-- Créer la table Dogs pour stocker les données des chiens
CREATE TABLE IF NOT EXISTS Dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  birthdate DATE,
  sex TEXT CHECK (sex IN ('male', 'female', 'unknown')),
  photo_url TEXT,
  situation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur user_id pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_dogs_user_id ON Dogs(user_id);

-- Ajouter les permissions RLS (Row Level Security)
ALTER TABLE Dogs ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs de voir leurs propres chiens
CREATE POLICY "Users can view their own dogs" ON Dogs
  FOR SELECT USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de mettre à jour leurs propres chiens
CREATE POLICY "Users can update their own dogs" ON Dogs
  FOR UPDATE USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de créer leurs propres chiens
CREATE POLICY "Users can insert their own dogs" ON Dogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de supprimer leurs propres chiens
CREATE POLICY "Users can delete their own dogs" ON Dogs
  FOR DELETE USING (auth.uid() = user_id);
