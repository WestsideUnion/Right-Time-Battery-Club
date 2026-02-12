'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import Input from '@/components/ui/Input';

export default function SearchInput() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="w-full max-w-sm">
            <input
                className="w-full px-4 py-2 bg-[var(--brand-surface)] border border-white/10 rounded-lg text-white placeholder:text-[var(--brand-slate)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/50 transition-all"
                placeholder="Search by name, email, or wallet..."
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('q')?.toString()}
            />
        </div>
    );
}
