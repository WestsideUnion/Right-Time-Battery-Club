'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface ConfirmItem {
    watchModel: string;
    batteryModelNo: string;
    price: string;
}

interface ReceiptConfirmationProps {
    items: ConfirmItem[];
    serviceDate: string;
    onConfirm: (items: ConfirmItem[], serviceDate: string) => void;
    loading?: boolean;
}

export default function ReceiptConfirmation({
    items: initialItems,
    serviceDate: initialDate,
    onConfirm,
    loading,
}: ReceiptConfirmationProps) {
    const [items, setItems] = useState<ConfirmItem[]>(initialItems);
    const [serviceDate, setServiceDate] = useState(initialDate);

    const updateItem = (index: number, field: keyof ConfirmItem, value: string) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const addItem = () => {
        setItems((prev) => [...prev, { watchModel: '', batteryModelNo: '', price: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Confirm Receipt Details</h3>
                <p className="text-sm text-[var(--brand-slate)]">
                    Review and edit the extracted information below.
                </p>
            </div>

            <Input
                label="Service Date"
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-[var(--brand-slate)]">
                        Battery Items ({items.length})
                    </h4>
                    <button
                        type="button"
                        onClick={addItem}
                        className="text-sm text-[var(--brand-gold)] hover:underline cursor-pointer"
                    >
                        + Add Item
                    </button>
                </div>

                {items.map((item, i) => (
                    <div key={i} className="glass-light p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--brand-gold)] tracking-widest">
                                ITEM {i + 1}
                            </span>
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(i)}
                                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <Input
                                label="Watch Model"
                                value={item.watchModel}
                                onChange={(e) => updateItem(i, 'watchModel', e.target.value)}
                                placeholder="e.g. Seiko SNK809"
                            />
                            <Input
                                label="Battery Model No"
                                value={item.batteryModelNo}
                                onChange={(e) => updateItem(i, 'batteryModelNo', e.target.value)}
                                placeholder="e.g. SR920SW"
                            />
                            <Input
                                label="Price"
                                value={item.price}
                                onChange={(e) => updateItem(i, 'price', e.target.value)}
                                placeholder="e.g. 15.00"
                                type="number"
                                step="0.01"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <Button
                onClick={() => onConfirm(items, serviceDate)}
                loading={loading}
                className="w-full"
                size="lg"
            >
                Confirm Receipt
            </Button>
        </div>
    );
}
