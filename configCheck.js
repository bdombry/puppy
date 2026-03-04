/**
 * Configuration Verification
 * ✅ Checks if Supabase & RevenueCat are properly configured
 */

import ENV from './config/env';
import { supabase } from './config/supabase';

console.log('==========================================');
console.log('🔍 CONFIGURATION CHECK');
console.log('==========================================');

// ✅ Check Environment Variables
console.log('\n📋 Environment Variables:');
console.log('  EXPO_PUBLIC_SUPABASE_URL:', ENV.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  EXPO_PUBLIC_SUPABASE_ANON_KEY:', ENV.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('  EXPO_PUBLIC_REVENUE_CAT_API_KEY:', ENV.REVENUE_CAT_API_KEY ? '✅ Set' : '❌ Missing');

// ✅ Check Supabase Client
console.log('\n🗄️ Supabase Client:');
console.log('  URL:', supabase?.supabaseUrl ? '✅ Connected' : '❌ Not connected');
console.log('  Key:', supabase?.supabaseKey ? '✅ Configured' : '❌ Not configured');

// ✅ Summary
console.log('\n==========================================');
const allGood = ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY && ENV.REVENUE_CAT_API_KEY;
if (allGood) {
  console.log('✅ All configurations look good! 🎉');
} else {
  console.log('❌ Some configurations are missing. Check .env file.');
}
console.log('==========================================\n');

export default null;
