/**
 * Configuration des variables d'environnement
 * Charge les clés API depuis le fichier .env
 */

// En développement, utilisez un package comme 'dotenv' pour charger .env
// En production (EAS), utilisez les secrets d'Expo Build Secrets
// Pour plus d'infos: https://docs.expo.dev/build-reference/variables/

const ENV = {
  // Supabase
  SUPABASE_URL: 'https://nbcbujuxoyifqjyrjaci.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY2J1anV4b3lpZnFqeXJqYWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjgyMzYsImV4cCI6MjA3ODU0NDIzNn0.GPgsE91rOt6Dsr-r3eHMEgKUX92Py4sdzVHo9dhDptA',
  
  // RevenueCat
  REVENUE_CAT_API_KEY: 'appl_PuCLnbCQMkhIZrsPeIsPNTUQWDg',

  // Expo
  EXPO_PROJECT_ID: 'c85a1484-9e01-422c-b2d3-11ebb4059322',
};

export default ENV;
