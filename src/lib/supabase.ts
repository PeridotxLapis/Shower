import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BathingSession = {
  id: string;
  user_id: string;
  mode: 'Bath' | 'Shower' | 'Both';
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
};
