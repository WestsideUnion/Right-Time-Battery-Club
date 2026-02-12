import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    let redirect = searchParams.get('redirect');

    if (!redirect || redirect === '/') {
        redirect = '/dashboard';
    }

    if (code) {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.error('Auth Exchange Error:', error);

        if (!error && user) {
            // Ensure a customer record exists for this user
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('auth_user_id', user.id)
                .maybeSingle();

            if (!existingCustomer) {
                // Get the default shop
                const { data: shop } = await supabase
                    .from('shops')
                    .select('id')
                    .eq('slug', 'right-time')
                    .single();

                if (shop) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from('customers') as any).insert({
                        auth_user_id: user.id,
                        email: user.email!,
                        shop_id: (shop as any).id,
                    });
                }
            }

            return NextResponse.redirect(`${origin}${redirect}`);
        }
    }

    // Auth error — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth`);
}
