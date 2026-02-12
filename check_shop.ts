
import { createClient } from '@/lib/supabase/server';
// Note: using server client usually requires being in a Next.js server context (like route handler or server component).
// Since we want to run this as a standalone script, we might need to use `createClient` from `@supabase/supabase-js` directly with env vars, 
// OR use code that adapts to it. Be careful with 'server' client in standalone scripts.

// Let's try reading env vars and using supabase-js directly to be safe and avoiding Next.js context issues.
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// ideally service role key if we want to bypass RLS, but for checking public 'shops' table, anon key might work if RLS allows reading shops.
// If RLS blocks it, we need SERVICE_ROLE_KEY.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

async function checkShop() {
    console.log('Checking for shop with slug: right-time');
    const { data: shop, error } = await supabase
        .from('shops')
        .select('id, name, slug')
        .eq('slug', 'right-time')
        .single();

    if (error) {
        console.error('Error fetching shop:', error);
    } else {
        console.log('Shop found:', shop);
    }
}

checkShop();
