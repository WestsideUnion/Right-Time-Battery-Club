import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Customer } from '@/types/database';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify admin
        const { data: membershipData } = await supabase
            .from('shop_members')
            .select('shop_id')
            .eq('user_id', user.id)
            .maybeSingle();

        const membership = membershipData as { shop_id: string } | null;

        if (!membership) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get opted-in customers
        const { data, error } = await supabase
            .from('customers')
            .select('email, display_name, marketing_opt_in, created_at')
            .eq('shop_id', membership.shop_id)
            .eq('marketing_opt_in', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const customers = (data || []) as Pick<Customer, 'email' | 'display_name' | 'marketing_opt_in' | 'created_at'>[];

        // Build CSV
        const headers = ['Email', 'Display Name', 'Marketing Opt-In', 'Created At'];
        const rows = customers.map((c) => [
            c.email,
            c.display_name || '',
            c.marketing_opt_in ? 'Yes' : 'No',
            new Date(c.created_at).toISOString(),
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (err) {
        console.error('CSV export error:', err);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
