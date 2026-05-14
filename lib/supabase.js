import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dobpdssgdfaiharnmpdf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            persistSession: true,
            storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
            autoRefreshToken: true,
        }
    }
)

