-- Table pour tracker les abonnements premium (analytics)
-- Synchronisée depuis RevenueCat côté client
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  entitlement_id TEXT,
  product_id TEXT,
  expires_at TIMESTAMPTZ,
  original_purchase_date TIMESTAMPTZ,
  latest_purchase_date TIMESTAMPTZ,
  revenue_cat_user_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index pour requêtes analytics
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_premium ON user_subscriptions(is_premium);

-- RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- L'utilisateur peut lire/écrire sa propre ligne
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own subscription" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
