'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const isAdmin = pathname.startsWith('/admin');

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--brand-gold)] to-[var(--brand-gold-light)] flex items-center justify-center transition-transform group-hover:scale-105">
                            <svg className="w-5 h-5 text-[var(--brand-navy)]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="font-semibold text-white tracking-tight hidden sm:block">
                            Right Time
                        </span>
                    </Link>

                    {/* Nav */}
                    <nav className="flex items-center gap-1">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${pathname.startsWith('/dashboard')
                                            ? 'bg-white/10 text-white'
                                            : 'text-[var(--brand-slate)] hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isAdmin
                                            ? 'bg-white/10 text-white'
                                            : 'text-[var(--brand-slate)] hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Admin
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="ml-2 px-4 py-2 text-sm text-[var(--brand-slate)] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold-light)] text-[var(--brand-navy)] rounded-lg hover:shadow-lg hover:shadow-[var(--brand-gold)]/20 transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
