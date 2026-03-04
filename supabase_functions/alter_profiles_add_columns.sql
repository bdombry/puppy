-- Correction du CHECK constraint sur age_range
-- Les options onboarding envoient '45-54' et '55+' qui doivent matcher le constraint
-- Exécuter seulement si le CHECK constraint existe et bloque les inserts

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_age_range_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_age_range_check 
  CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55+', NULL));
