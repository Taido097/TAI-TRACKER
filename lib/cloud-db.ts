import { createClient } from '@supabase/supabase-js';

export function getCloudDb() {
  const env = process.env;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
}
