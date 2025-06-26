import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

console.log('supabaseUrl', supabaseUrl);
console.log('supabaseAnonKey', supabaseAnonKey ? '***' : 'missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
