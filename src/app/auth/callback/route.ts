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
                .select('id, display_name')
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
                    const metadata = user.user_metadata || {};
                    const displayName = metadata.full_name || metadata.name || metadata.u_name || '';

                    await (supabase.from('customers') as any).insert({
                        auth_user_id: user.id,
                        email: user.email!,
                        display_name: displayName,
                        shop_id: (shop as any).id,
                    });
                }
            } else {
                // Check if we should update the name (e.g. if it's missing)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const customer = existingCustomer as any;
                if (!customer.display_name) {
                    const metadata = user.user_metadata || {};
                    const displayName = metadata.full_name || metadata.name || metadata.u_name || '';

                    if (displayName) {
                        await (supabase
                            .from('customers') as any)
                            .update({ display_name: displayName })
                            .eq('id', customer.id);
                    }
                }
            }

            return NextResponse.redirect(`${origin}${redirect}`);
        }
    }

    // Auth error — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth`);
}
