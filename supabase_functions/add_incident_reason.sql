-- Migration: Add incident_reason column to outings table
-- Date: 2025-12-04
-- Description: Track the reason why an accident happened

ALTER TABLE outings 
ADD COLUMN incident_reason VARCHAR(50) DEFAULT NULL;

-- Create an index for querying by dog and date
CREATE INDEX idx_outings_dog_datetime 
ON outings(dog_id, datetime DESC);

-- Add a comment to document the field
COMMENT ON COLUMN outings.incident_reason IS 'Reason for the incident: pas_le_temps, trop_tard, flemme, oublie, autre, or NULL for non-incidents';
