'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <Button
                variant="secondary"
                onClick={() => router.back()}
                className="mb-8"
                size="sm"
            >
                ← Back
            </Button>

            <Card>
                <div className="prose prose-invert max-w-none">
                    <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
                    <p className="text-[var(--brand-slate)] mb-4">Last Updated: February 12, 2026</p>

                    <section className="mb-8 font-inter">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">1. Introduction</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            Welcome to <strong>Right-Time Battery Club</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">2. Information We Collect</h2>
                        <div className="space-y-4 text-[var(--brand-slate)]">
                            <p>We collect information that you provide directly to us:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Account Information:</strong> When you sign in via Google or Magic Link, we collect your email address.</li>
                                <li><strong>Receipt Data:</strong> We collect images of your receipts and the extracted data (watch model, battery type, service date) to provide warranty tracking services.</li>
                                <li><strong>Usage Data:</strong> We may collect technical information about how you access and use the service.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">3. How We Use Your Information</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            We use the collected information to:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-[var(--brand-slate)]">
                            <li>Provide and maintain the Battery Club service.</li>
                            <li>Track your watch battery warranties and notify you of upcoming expirations.</li>
                            <li>Identify your watch models and battery types using AI (Gemini 1.5 Flash).</li>
                            <li>Communicate with you regarding your account or service updates.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">4. Data Security</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            We use Supabase (an enterprise-grade backend service) to store your data securely. Receipt images are stored in protected storage buckets with restricted access.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">5. Third-Party Services</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            We use the following third-party services:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-[var(--brand-slate)]">
                            <li><strong>Google Cloud:</strong> For user authentication and AI-based receipt processing.</li>
                            <li><strong>Supabase:</strong> For database and image storage.</li>
                            <li><strong>Vercel:</strong> For hosting the application.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">6. Contact Us</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            If you have questions about this policy, please contact us at support@right-time.com.
                        </p>
                    </section>
                </div>
            </Card>
        </div>
    );
}
