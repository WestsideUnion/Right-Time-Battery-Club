/**
 * Warranty status helpers.
 * - Warranty: 12 months from service date
 * - Retention: 13 months from service date (then delete)
 */

export type WarrantyStatus = 'active' | 'expiring' | 'expired';

const TWELVE_MONTHS_MS = 12 * 30.44 * 24 * 60 * 60 * 1000; // ~365.25 days
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function getWarrantyStatus(serviceDate: string | Date): WarrantyStatus {
    const service = new Date(serviceDate);
    const now = new Date();
    const expiresAt = new Date(service.getTime() + TWELVE_MONTHS_MS);
    const warningAt = new Date(expiresAt.getTime() - THIRTY_DAYS_MS);

    if (now >= expiresAt) return 'expired';
    if (now >= warningAt) return 'expiring';
    return 'active';
}

export function getWarrantyExpiryDate(serviceDate: string | Date): Date {
    const service = new Date(serviceDate);
    return new Date(service.getTime() + TWELVE_MONTHS_MS);
}

export function getDaysRemaining(serviceDate: string | Date): number {
    const expiresAt = getWarrantyExpiryDate(serviceDate);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function formatWarrantyStatus(status: WarrantyStatus): string {
    switch (status) {
        case 'active':
            return 'Under Warranty';
        case 'expiring':
            return 'Expiring Soon';
        case 'expired':
            return 'Warranty Expired';
    }
}
