import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lpzwnbrjpayjhlwjmuda.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
