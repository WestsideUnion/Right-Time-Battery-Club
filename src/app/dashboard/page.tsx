import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getWarrantyStatus, getDaysRemaining } from '@/lib/warranty';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: customerData } = await supabase
        .from('customers')
        .select('id, display_name, email')
        .eq('auth_user_id', user!.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = customerData as any;

    const { data: receiptsData } = await supabase
        .from('receipts')
        .select('*, receipt_items(*)')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('customer_id', (customer as any)?.id)
        .order('created_at', { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const receipts = receiptsData as any[];

    const activeReceipts = receipts?.filter((r) => r.status === 'confirmed' && r.service_date) || [];
    const activeCount = activeReceipts.filter((r) => getWarrantyStatus(r.service_date!) === 'active').length;
    const expiringCount = activeReceipts.filter((r) => getWarrantyStatus(r.service_date!) === 'expiring').length;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Welcome */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome{customer?.display_name ? `, ${customer.display_name}` : ''}
                    </h1>
                    <p className="text-sm text-[var(--brand-slate)] mt-1">{customer?.email}</p>
                </div>
                <Link
                    href="/dashboard/upload"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold-light)] text-[var(--brand-navy)] font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--brand-gold)]/20 transition-all duration-200 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Upload Receipt
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white">{activeReceipts.length}</p>
                        <p className="text-xs text-[var(--brand-slate)] mt-1">Total Receipts</p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-400">{activeCount}</p>
                        <p className="text-xs text-[var(--brand-slate)] mt-1">Under Warranty</p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-400">{expiringCount}</p>
                        <p className="text-xs text-[var(--brand-slate)] mt-1">Expiring Soon</p>
                    </div>
                </Card>
            </div>

            {/* Receipt List */}
            <h2 className="text-lg font-semibold text-white mb-4">Your Receipts</h2>
            {activeReceipts.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--brand-surface-light)] flex items-center justify-center">
                            <svg className="w-8 h-8 text-[var(--brand-slate)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <p className="text-[var(--brand-slate)]">No receipts yet</p>
                        <Link href="/dashboard/upload" className="text-sm text-[var(--brand-gold)] hover:underline mt-2 inline-block">
                            Upload your first receipt →
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {activeReceipts.map((receipt) => {
                        const status = getWarrantyStatus(receipt.service_date!);
                        const days = getDaysRemaining(receipt.service_date!);
                        const items = receipt.receipt_items || [];

                        return (
                            <Link key={receipt.id} href={`/dashboard/receipts/${receipt.id}`}>
                                <Card className="hover:bg-white/[0.03] transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-white font-medium truncate">
                                                    {items.length > 0
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        ? items.map((i: any) => i.watch_model).join(', ')
                                                        : 'Untitled Receipt'}
                                                </h3>
                                                <Badge status={status} />
                                            </div>
                                            <p className="text-sm text-[var(--brand-slate)]">
                                                {new Date(receipt.service_date!).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                })}
                                                {' · '}
                                                {items.length} item{items.length !== 1 ? 's' : ''}
                                                {status !== 'expired' && ` · ${days} days remaining`}
                                            </p>
                                        </div>
                                        <svg className="w-5 h-5 text-[var(--brand-slate)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
