-- Add treat column to activities table if it doesn't exist
-- This is safe and won't error if the column already exists

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS treat BOOLEAN DEFAULT false;

-- If you need to add it manually and the above doesn't work:
-- ALTER TABLE activities
-- ADD COLUMN treat BOOLEAN DEFAULT false;

-- This allows tracking treats given during activities (balades)
-- Same as outings table for consistency
