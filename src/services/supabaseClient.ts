import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'urlhkzdfawqiecsybuio';
const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YRDB4a0UsOyLtxbKL3Xs2Q_3g3QclvN';

function resolveSupabaseUrl(raw?: string): string {
  const trimmed = raw?.trim() || '';
  if (
    /^https?:\/\/[a-z0-9.-]+/i.test(trimmed) &&
    !trimmed.includes('your-project-id') &&
    !trimmed.includes('MY_')
  ) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return trimmed;
      }
    } catch {
      // fall through to default
    }
  }
  return DEFAULT_SUPABASE_URL;
}

function resolveSupabaseKey(raw?: string): string {
  const trimmed = raw?.trim() || '';
  if (
    (trimmed.startsWith('sb_publishable_') || trimmed.startsWith('eyJ')) &&
    !trimmed.includes('your_publishable_key') &&
    !trimmed.includes('MY_')
  ) {
    return trimmed;
  }
  return DEFAULT_SUPABASE_PUBLISHABLE_KEY;
}

export const SUPABASE_URL = resolveSupabaseUrl(
  import.meta.env.VITE_SUPABASE_URL as string | undefined
);

export const SUPABASE_PUBLISHABLE_KEY = resolveSupabaseKey(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
  },
});
