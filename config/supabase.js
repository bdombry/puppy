import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés publiques - OK à mettre en dur (test temporaire)
export const supabase = createClient(
  'https://nbcbujuxoyifqjyrjaci.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY2J1anV4b3lpZnFqeXJqYWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjgyMzYsImV4cCI6MjA3ODU0NDIzNn0.GPgsE91rOt6Dsr-r3eHMEgKUX92Py4sdzVHo9dhDptA',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);