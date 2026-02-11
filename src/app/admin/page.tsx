import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getWarrantyStatus } from '@/lib/warranty';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { ReceiptWithItems, ReceiptItem } from '@/types/database';

interface ReceiptWithCustomer extends ReceiptWithItems {
    customers: { email: string; display_name: string | null } | null;
}

export default async function AdminPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Get admin's shop
    const { data: membership } = await supabase
        .from('shop_members')
        .select('shop_id')
        .eq('user_id', user!.id)
        .single();

    const shopId = (membership as unknown as { shop_id: string }).shop_id;

    // Stats
    const { count: totalReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);

    const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);

    // Recent receipts
    const { data } = await supabase
        .from('receipts')
        .select('*, receipt_items(*), customers(email, display_name)')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(20);

    const receipts = (data || []) as unknown as ReceiptWithCustomer[];

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-sm text-[var(--brand-slate)] mt-1">Manage receipts and customers</p>
                </div>
                <a
                    href="/api/admin/export-csv"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-surface-light)] text-white border border-white/10 rounded-xl text-sm font-medium hover:border-white/20 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export CSV
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Total Receipts</p>
                    <p className="text-3xl font-bold text-white">{totalReceipts || 0}</p>
                </Card>
                <Card>
                    <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Total Customers</p>
                    <p className="text-3xl font-bold text-white">{totalCustomers || 0}</p>
                </Card>
                <Card>
                    <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Active Warranties</p>
                    <p className="text-3xl font-bold text-green-400">
                        {receipts.filter((r) => r.service_date && getWarrantyStatus(r.service_date) === 'active').length}
                    </p>
                </Card>
                <Card>
                    <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Expiring Soon</p>
                    <p className="text-3xl font-bold text-yellow-400">
                        {receipts.filter((r) => r.service_date && getWarrantyStatus(r.service_date) === 'expiring').length}
                    </p>
                </Card>
            </div>

            {/* Receipts Table */}
            <Card>
                <h2 className="text-lg font-semibold text-white mb-4">Recent Receipts</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Customer</th>
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Items</th>
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Service Date</th>
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-[var(--brand-slate)] font-medium">Warranty</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.map((receipt) => {
                                const warrantyStatus = receipt.service_date ? getWarrantyStatus(receipt.service_date) : 'expired' as const;
                                const customer = receipt.customers;
                                const items = receipt.receipt_items || [];

                                return (
                                    <tr key={receipt.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4">
                                            <p className="text-white">{customer?.display_name || customer?.email || '—'}</p>
                                            {customer?.display_name && (
                                                <p className="text-xs text-[var(--brand-slate)]">{customer.email}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-[var(--brand-slate)]">
                                            {items.map((i: ReceiptItem) => i.watch_model).join(', ') || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-[var(--brand-slate)]">
                                            {receipt.service_date
                                                ? new Date(receipt.service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs capitalize text-[var(--brand-slate)]">{receipt.status}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge status={warrantyStatus} />
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/admin/receipts/${receipt.id}`}
                                                className="text-[var(--brand-gold)] hover:underline text-xs"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
