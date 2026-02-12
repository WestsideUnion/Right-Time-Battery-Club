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
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setUserEmail(user?.email || null);
        };
        getUser();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[var(--brand-gold)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src="/logo.png"
                            alt="Right Time"
                            className="h-10 w-auto relative z-10 invert brightness-200"
                        />
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {userEmail ? (
                        <>
                            <Link
                                href="/dashboard"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === '/dashboard'
                                    ? 'bg-white/10 text-white'
                                    : 'text-[var(--brand-slate)] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Dashboard
                            </Link>

                            {userEmail === 'info@righttimeinc.com' && (
                                <Link
                                    href="/admin"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname.startsWith('/admin')
                                        ? 'bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]'
                                        : 'text-[var(--brand-slate)] hover:text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/5'
                                        }`}
                                >
                                    Admin
                                </Link>
                            )}

                            <button
                                onClick={handleSignOut}
                                className="ml-4 px-4 py-2 text-sm font-medium text-[var(--brand-slate)] hover:text-white transition-colors cursor-pointer"
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
        </header>
    );
}
