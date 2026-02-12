'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { parseReceipt } from '@/lib/receipt-parser';
import ImageDropzone from '@/components/upload/ImageDropzone';
import ReceiptConfirmation, { ConfirmItem } from '@/components/upload/ReceiptConfirmation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type Step = 'upload' | 'text' | 'confirm' | 'done';

export default function UploadPage() {
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [rawText, setRawText] = useState('');
    const [items, setItems] = useState<ConfirmItem[]>([]);
    const [serviceDate, setServiceDate] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getOrCreateCustomer = async (user: any) => {
        // 1. Try to find existing
        const { data: existing, error: findError } = await (supabase
            .from('customers') as any)
            .select('id, shop_id')
            .eq('auth_user_id', user.id)
            .maybeSingle();

        if (existing) return existing;

        // 2. If not found, create new
        console.log('Customer not found, creating new record...');

        // Get default shop
        const { data: shop } = await (supabase
            .from('shops') as any)
            .select('id')
            .eq('slug', 'right-time')
            .single();

        if (!shop) throw new Error('Default shop configuration missing');

        const { data: newCustomer, error: createError } = await (supabase
            .from('customers') as any)
            .insert({
                auth_user_id: user.id,
                email: user.email,
                shop_id: shop.id,
            })
            .select('id, shop_id')
            .single();

        if (createError) {
            console.error('Failed to create customer:', createError);
            throw new Error('Failed to create customer profile');
        }

        return newCustomer;
    };

    const handleFile = (f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        try {
            // Get current user + customer
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get customer (create if missing)
            const customer = await getOrCreateCustomer(user);

            // Upload to storage
            const ext = file.name.split('.').pop();
            const path = `${customer.shop_id}/${customer.id}/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('receipt-images')
                .upload(path, file, { contentType: file.type });

            if (uploadError) throw uploadError;
            setImagePath(path);

            // Move to text input step (for manual OCR input)
            setStep('text');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleParse = () => {
        const result = parseReceipt(rawText);
        setServiceDate(
            result.serviceDate
                ? new Date(result.serviceDate).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)
        );
        setItems(
            result.items.length > 0
                ? result.items.map((i) => ({ watchModel: i.watchModel, brandCode: i.brandCode, price: '' }))
                : [{ watchModel: '', brandCode: '', price: '' }]
        );
        setStep('confirm');
    };

    const handleConfirm = async (confirmedItems: ConfirmItem[], confirmedDate: string) => {
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get customer (create if missing)
            const customer = await getOrCreateCustomer(user);

            const serviceDateTime = new Date(confirmedDate);
            const expiresAt = new Date(serviceDateTime);
            expiresAt.setMonth(expiresAt.getMonth() + 12);

            // Create receipt
            const { data: receipt, error: receiptError } = await (supabase
                .from('receipts') as any)
                .insert({
                    customer_id: customer.id,
                    shop_id: customer.shop_id,
                    image_path: imagePath,
                    service_date: serviceDateTime.toISOString(),
                    raw_text: rawText,
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                })
                .select('id')
                .single();

            if (receiptError) throw receiptError;

            // Create receipt items
            const itemInserts = confirmedItems.map((item) => ({
                receipt_id: receipt!.id,
                shop_id: customer.shop_id,
                watch_model: item.watchModel,
                brand_code: item.brandCode || null,
                price: item.price ? parseFloat(item.price) : null,
                confirmed: true,
            }));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: itemsError } = await (supabase.from('receipt_items') as any).insert(itemInserts);
            if (itemsError) throw itemsError;

            setStep('done');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {['Upload', 'Extract', 'Confirm', 'Done'].map((label, i) => {
                    const stepOrder = ['upload', 'text', 'confirm', 'done'];
                    const currentIndex = stepOrder.indexOf(step);
                    const isComplete = i < currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                        <div key={label} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isComplete
                                    ? 'bg-[var(--brand-gold)] text-[var(--brand-navy)]'
                                    : isCurrent
                                        ? 'bg-[var(--brand-gold)]/20 text-[var(--brand-gold)] ring-2 ring-[var(--brand-gold)]/50'
                                        : 'bg-[var(--brand-surface-light)] text-[var(--brand-slate)]'
                                    }`}
                            >
                                {isComplete ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs hidden sm:block ${isCurrent ? 'text-white' : 'text-[var(--brand-slate)]'}`}>
                                {label}
                            </span>
                            {i < 3 && <div className={`w-8 h-px ${isComplete ? 'bg-[var(--brand-gold)]' : 'bg-white/10'}`} />}
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Step 1: Upload */}
            {step === 'upload' && (
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-6">Upload Receipt Photo</h2>
                    <ImageDropzone onFile={handleFile} preview={preview} />
                    <div className="mt-6">
                        <Button onClick={handleUpload} loading={loading} disabled={!file} className="w-full" size="lg">
                            Upload & Continue
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 2: Text Input (manual OCR) */}
            {step === 'text' && (
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-2">Enter Receipt Text</h2>
                    <p className="text-sm text-[var(--brand-slate)] mb-6">
                        Paste or type the receipt content below. Our parser will extract battery change items automatically.
                    </p>
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full h-48 px-4 py-3 bg-[var(--brand-surface)] border border-white/10 rounded-xl text-white placeholder:text-[var(--brand-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/50 font-mono text-sm resize-none"
                        placeholder={`Example:\n12/01/2025 14:30\nBattery change Seiko SNK809\nSEI\nBattery change Citizen Eco-Drive\nCIT`}
                    />
                    <div className="flex gap-3 mt-6">
                        <Button variant="secondary" onClick={() => { setRawText(''); handleParse(); }} className="flex-1">
                            Skip — Enter Manually
                        </Button>
                        <Button onClick={handleParse} disabled={!rawText.trim()} className="flex-1">
                            Parse Receipt
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
                <Card>
                    <ReceiptConfirmation
                        items={items}
                        serviceDate={serviceDate}
                        onConfirm={handleConfirm}
                        loading={loading}
                    />
                </Card>
            )}

            {/* Step 4: Done */}
            {step === 'done' && (
                <Card glow>
                    <div className="text-center py-8">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Receipt Saved!</h2>
                        <p className="text-[var(--brand-slate)] mb-8">
                            Your warranty is now being tracked. You&apos;ll see it on your dashboard.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => router.push('/dashboard')}>
                                Go to Dashboard
                            </Button>
                            <Button variant="secondary" onClick={() => { setStep('upload'); setFile(null); setPreview(''); setRawText(''); }}>
                                Upload Another
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
