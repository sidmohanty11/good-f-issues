import { createClient } from '@supabase/supabase-js'

const URL = (import.meta as any).env.VITE_SUPABASE_URL
const ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(URL, ANON_KEY, {
    auth: {
        persistSession: true,
    }
})
