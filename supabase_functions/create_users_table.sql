-- Créer la table users pour stocker les données de l'utilisateur
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  age_range TEXT CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55+', NULL)),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say', NULL)),
  family_situation TEXT CHECK (family_situation IN ('single', 'couple', 'family', NULL)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer un index sur email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ajouter les permissions RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view their own user data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update their own user data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Permettre aux utilisateurs de créer leur propre profil lors de l'inscription
CREATE POLICY "Users can insert their own user data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
