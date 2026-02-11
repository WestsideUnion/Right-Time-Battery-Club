import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import type { Customer } from '@/types/database';

export default async function AdminCustomersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: membership } = await supabase
        .from('shop_members')
        .select('shop_id')
        .eq('user_id', user!.id)
        .single();

    const shopId = (membership as unknown as { shop_id: string }).shop_id;

    const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

    const customers = (data || []) as Customer[];

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Customers</h1>
                    <p className="text-sm text-[var(--brand-slate)] mt-1">{customers.length} total customers</p>
                </div>
                <a
                    href="/api/admin/export-csv"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold-light)] text-[var(--brand-navy)] font-semibold rounded-xl text-sm hover:shadow-lg transition-all"
                >
                    Export Opted-In CSV
                </a>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Email</th>
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Name</th>
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Marketing</th>
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-4 text-white">{customer.email}</td>
                                    <td className="py-3 px-4 text-[var(--brand-slate)]">{customer.display_name || '—'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${customer.marketing_opt_in
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-white/5 text-[var(--brand-slate)]'
                                            }`}>
                                            {customer.marketing_opt_in ? 'Opted In' : 'Not Opted In'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-[var(--brand-slate)]">
                                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
