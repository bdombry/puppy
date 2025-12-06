-- Migration: Add dog_asked_for_walk column to activities and outings tables
-- Date: 2025-12-04
-- Description: Track if the dog asked for the walk/outing

-- Add column to activities table
ALTER TABLE activities 
ADD COLUMN dog_asked_for_walk BOOLEAN DEFAULT false;

-- Add column to outings table
ALTER TABLE outings 
ADD COLUMN dog_asked_for_walk BOOLEAN DEFAULT false;

-- Create indexes for querying by this field
CREATE INDEX idx_activities_dog_asked_for_walk 
ON activities(dog_id, dog_asked_for_walk, datetime DESC);

CREATE INDEX idx_outings_dog_asked_for_walk 
ON outings(dog_id, dog_asked_for_walk, datetime DESC);

-- Add comments to document the fields
COMMENT ON COLUMN activities.dog_asked_for_walk IS 'Boolean flag indicating if the dog initiated/asked for the walk';
COMMENT ON COLUMN outings.dog_asked_for_walk IS 'Boolean flag indicating if the dog initiated/asked for the outing';
