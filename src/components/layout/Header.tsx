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
                    <Link href="/" className="flex items-center gap-4 group">
                        <img
                            src="/logo.png"
                            alt="Right Time"
                            className="h-10 w-auto invert brightness-200 transition-transform group-hover:scale-105"
                        />
                        <span className="font-bold text-white tracking-tight hidden sm:block">
                            Right Time <span className="text-[var(--brand-gold)]">Battery Club</span>
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
