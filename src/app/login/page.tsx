'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

import { getURL } from '@/lib/utils';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const handleGoogleLogin = async () => {
        try {
            const supabase = createClient();
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${getURL()}auth/callback?redirect=${encodeURIComponent(redirect)}`,
                },
            });
            if (authError) throw authError;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = createClient();
            const { error: authError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${getURL()}auth/callback?redirect=${encodeURIComponent(redirect)}`,
                },
            });

            if (authError) throw authError;
            setSent(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="glass p-8 sm:p-10 glow-gold animate-fade-in">
                {/* Logo */}
                <div className="flex items-center justify-center gap-4 mb-8 text-center">
                    <img
                        src="/logo.png"
                        alt="Right Time"
                        className="h-16 w-auto invert brightness-200"
                    />
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-white leading-none">Right Time</h2>
                        <h3 className="text-lg font-semibold text-[var(--brand-gold)] leading-none mt-1">Battery Club</h3>
                    </div>
                </div>

                {!sent ? (
                    <>
                        <h1 className="text-2xl font-bold text-white text-center mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-[var(--brand-slate)] text-center text-sm mb-8">
                            Sign in to your account to continue.
                        </p>

                        <div className="space-y-4 mb-8">
                            <Button
                                variant="secondary"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-gray-900 border-none h-12"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[var(--brand-navy)] px-2 text-[var(--brand-slate)]">Or continue with email</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />

                            {error && (
                                <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full"
                                size="lg"
                            >
                                Send Magic Link
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Check Your Email</h2>
                        <p className="text-[var(--brand-slate)] text-sm mb-6">
                            We sent a sign-in link to <strong className="text-white">{email}</strong>.
                            Click the link to continue.
                        </p>
                        <button
                            onClick={() => setSent(false)}
                            className="text-sm text-[var(--brand-gold)] hover:underline cursor-pointer"
                        >
                            Use a different email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {/* Decorative */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[var(--brand-gold)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-[var(--brand-blue)]/10 rounded-full blur-3xl" />

            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <div className="flex flex-col items-center gap-8">
                    <LoginForm />

                    <footer className="text-center text-xs text-[var(--brand-slate)] space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <Link href="/privacy" className="hover:text-[var(--brand-gold)] transition-colors">
                            Privacy Policy
                        </Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-[var(--brand-gold)] transition-colors">
                            Terms of Service
                        </Link>
                    </footer>
                </div>
            </Suspense>
        </div>
    );
}
