'use client';

import { useState, Suspense } from 'react';
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
                            Enter your email to receive a secure sign-in link.
                            No password needed.
                        </p>

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
                <LoginForm />
            </Suspense>
        </div>
    );
}
