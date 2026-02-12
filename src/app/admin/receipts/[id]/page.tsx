'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getWarrantyStatus, getDaysRemaining, getWarrantyExpiryDate } from '@/lib/warranty';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { deleteReceipt } from '@/app/admin/actions'; // Server action
import type { Receipt, ReceiptItem } from '@/types/database';

interface ReceiptData extends Receipt {
    receipt_items: ReceiptItem[];
}

export default function AdminReceiptDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const supabase = createClient();

    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [items, setItems] = useState<ReceiptItem[]>([]);
    const [serviceDate, setServiceDate] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadReceipt();
    }, [id]);

    const loadReceipt = async () => {
        const { data } = await supabase
            .from('receipts')
            .select('*, receipt_items(*)')
            .eq('id', id)
            .single();

        const receiptData = data as unknown as ReceiptData | null;

        if (receiptData) {
            setReceipt(receiptData);
            setItems(receiptData.receipt_items || []);
            setServiceDate(receiptData.service_date ? new Date(receiptData.service_date).toISOString().slice(0, 10) : '');

            if (receiptData.image_path) {
                const { data: urlData } = await supabase.storage
                    .from('receipt-images')
                    .createSignedUrl(receiptData.image_path, 3600);
                setImageUrl(urlData?.signedUrl || null);
            }
        }
    };

    const updateItem = (itemId: string, field: string, value: string) => {
        setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, [field]: field === 'price' ? (value ? parseFloat(value) : null) : value } : i))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update Service Date
            const updates = {
                service_date: serviceDate ? new Date(serviceDate).toISOString() : null
            };

            const { error: receiptError } = await (supabase
                .from('receipts') as any)
                .update(updates)
                .eq('id', id);

            if (receiptError) throw receiptError;

            // Update Items
            for (const item of items) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from('receipt_items') as any)
                    .update({
                        watch_model: item.watch_model,
                        brand_code: item.brand_code,
                        price: item.price,
                    })
                    .eq('id', item.id);
            }
            setEditing(false);
            await loadReceipt();
        } catch (err) {
            console.error('Failed to save:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this receipt? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await deleteReceipt(id);
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete receipt.');
            setDeleting(false);
        }
    };

    if (!receipt) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full" />
            </div>
        );
    }

    const status = receipt.service_date ? getWarrantyStatus(receipt.service_date) : 'expired' as const;
    const days = receipt.service_date ? getDaysRemaining(receipt.service_date) : 0;
    const expiryDate = receipt.service_date ? getWarrantyExpiryDate(receipt.service_date) : null;

    return (
        <div className="max-w-3xl animate-fade-in">
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-[var(--brand-slate)] hover:text-white mb-6 transition-colors cursor-pointer"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back
            </button>

            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Receipt Detail</h1>
                    <p className="text-sm text-[var(--brand-slate)]">ID: {receipt.id.slice(0, 8)}…</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge status={status} />
                    <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
                        Delete
                    </Button>
                </div>
            </div>

            {/* Editing Service Date */}
            {editing && (
                <Card className="mb-6 border border-[var(--brand-gold)]/30">
                    <h3 className="text-sm font-semibold text-[var(--brand-gold)] mb-3">Editing Receipt Details</h3>
                    <Input
                        label="Service Date"
                        type="date"
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                    />
                </Card>
            )}

            {/* Warranty Info (Read Only) */}
            {!editing && receipt.service_date && (
                <Card glow className="mb-6">
                    <div className="grid sm:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-lg font-semibold ${status === 'active' ? 'text-green-400' : status === 'expiring' ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {status === 'active' ? 'Active' : status === 'expiring' ? 'Expiring' : 'Expired'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Days Left</p>
                            <p className="text-lg font-semibold text-white">{days}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--brand-slate)] uppercase tracking-widest mb-1">Expires</p>
                            <p className="text-lg font-semibold text-white">
                                {expiryDate ? expiryDate.toLocaleDateString() : '—'}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Items */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Items ({items.length})</h2>
                {!editing ? (
                    <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(false); loadReceipt(); }}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} loading={saving}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-6">
                {items.map((item) => (
                    <Card key={item.id}>
                        {editing ? (
                            <div className="grid sm:grid-cols-3 gap-3">
                                <Input
                                    label="Watch Model"
                                    value={item.watch_model}
                                    onChange={(e) => updateItem(item.id, 'watch_model', e.target.value)}
                                />
                                <Input
                                    label="Brand Code"
                                    value={item.brand_code || ''}
                                    onChange={(e) => updateItem(item.id, 'brand_code', e.target.value)}
                                />
                                <Input
                                    label="Price"
                                    value={item.price?.toString() || ''}
                                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                    type="number"
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">{item.watch_model}</p>
                                    <p className="text-sm text-[var(--brand-slate)]">
                                        {item.brand_code && `Brand: ${item.brand_code}`}
                                        {item.price && ` • $${Number(item.price).toFixed(2)}`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Image */}
            {imageUrl && (
                <>
                    <h2 className="text-lg font-semibold text-white mb-4">Receipt Photo</h2>
                    <Card>
                        <img src={imageUrl} alt="Receipt" className="max-w-full rounded-lg border border-white/10" />
                    </Card>
                </>
            )}
        </div>
    );
}
