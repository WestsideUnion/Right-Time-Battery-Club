import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWarrantyStatus, getDaysRemaining, getWarrantyExpiryDate } from '@/lib/warranty';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ReceiptDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user!.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = customerData as any;

    const { data: receiptData } = await supabase
        .from('receipts')
        .select('*, receipt_items(*)')
        .eq('id', id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('customer_id', (customer as any)?.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const receipt = receiptData as any;

    if (!receipt) notFound();

    const status = receipt.service_date ? getWarrantyStatus(receipt.service_date) : 'expired';
    const days = receipt.service_date ? getDaysRemaining(receipt.service_date) : 0;
    const expiryDate = receipt.service_date ? getWarrantyExpiryDate(receipt.service_date) : null;

    // Get signed URL if image exists
    let imageUrl: string | null = null;
    if (receipt.image_path) {
        const { data } = await supabase.storage
            .from('receipt-images')
            .createSignedUrl(receipt.image_path, 3600); // 1 hour
        imageUrl = data?.signedUrl || null;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Back */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-[var(--brand-slate)] hover:text-white mb-6 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Receipt Details</h1>
                    <p className="text-sm text-[var(--brand-slate)]">
                        Service date:{' '}
                        {receipt.service_date
                            ? new Date(receipt.service_date).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })
                            : 'Unknown'}
                    </p>
                </div>
                <Badge status={status} />
            </div>

            {/* Warranty Card */}
            {receipt.service_date && (
                <Card glow className="mb-6">
                    <div className="grid sm:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-lg font-semibold ${status === 'active' ? 'text-green-400' : status === 'expiring' ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {status === 'active' ? 'Under Warranty' : status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Days Remaining</p>
                            <p className="text-lg font-semibold text-white">{days}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Expires</p>
                            <p className="text-lg font-semibold text-white">
                                {expiryDate
                                    ? expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Items */}
            <h2 className="text-lg font-semibold text-white mb-4">Battery Items</h2>
            <div className="space-y-3 mb-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(receipt.receipt_items || []).map((item: any, i: any) => (
                    <Card key={item.id} className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">{item.watch_model}</p>
                            <p className="text-sm text-[var(--brand-slate)]">
                                {item.brand_code && `Brand: ${item.brand_code}`}
                                {item.price && ` • $${Number(item.price).toFixed(2)}`}
                            </p>
                        </div>
                        <span className="text-xs text-[var(--brand-gold)] font-bold">#{i + 1}</span>
                    </Card>
                ))}
            </div>

            {/* Receipt Image */}
            {imageUrl && (
                <>
                    <h2 className="text-lg font-semibold text-white mb-4">Receipt Photo</h2>
                    <Card>
                        <img
                            src={imageUrl}
                            alt="Receipt"
                            className="max-w-full rounded-lg border border-white/10"
                        />
                    </Card>
                </>
            )}
        </div>
    );
}
