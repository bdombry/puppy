import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nbcbujuxoyifqjyrjaci.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY2J1anV4b3lpZnFqeXJqYWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjgyMzYsImV4cCI6MjA3ODU0NDIzNn0.GPgsE91rOt6Dsr-r3eHMEgKUX92Py4sdzVHo9dhDptA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
