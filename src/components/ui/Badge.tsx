import React from 'react';
import { WarrantyStatus } from '@/lib/warranty';

interface BadgeProps {
    status: WarrantyStatus;
    children?: React.ReactNode;
}

const statusConfig: Record<WarrantyStatus, { className: string; label: string }> = {
    active: { className: 'badge-active', label: 'Under Warranty' },
    expiring: { className: 'badge-expiring', label: 'Expiring Soon' },
    expired: { className: 'badge-expired', label: 'Expired' },
};

export default function Badge({ status, children }: BadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${status === 'active'
                        ? 'bg-green-400'
                        : status === 'expiring'
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                    }`}
            />
            {children || config.label}
        </span>
    );
}
