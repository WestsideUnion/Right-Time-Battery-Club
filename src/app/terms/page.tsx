'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
                    <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
                    <p className="text-[var(--brand-slate)] mb-4">Last Updated: February 12, 2026</p>

                    <section className="mb-8 font-inter">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">1. Agreement to Terms</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            By accessing or using <strong>Right-Time Battery Club</strong>, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">2. Description of Service</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            Right-Time Battery Club provides a digital vault for watch service receipts and a tracking system for battery warranties. We use AI technology to assist in extracting data from receipt images.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">3. User Responsibilities</h2>
                        <ul className="list-disc pl-6 space-y-2 text-[var(--brand-slate)]">
                            <li>You are responsible for the accuracy of the information you upload.</li>
                            <li>You must review all AI-extracted information during the "Confirm" step for accuracy.</li>
                            <li>You agree not to upload fraudulent or illegal content.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">4. Warranty Disclaimer</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            The Battery Club is a tracking tool. The actual warranty is provided by the service center listed on your original receipt. Right-Time Battery Club is not responsible for the fulfillment of these warranties or for any damages resulting from relying on the digital tracker.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">5. Account Termination</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            We reserve the right to suspend or terminate your account if you violate these terms or engage in misuse of the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">6. Changes to Terms</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            We may update these terms from time to time. Your continued use of the service after such updates constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[var(--brand-gold)] mb-4">7. Governing Law</h2>
                        <p className="text-[var(--brand-slate)] leading-relaxed">
                            These terms are governed by the laws of the jurisdiction in which Right-Time operates.
                        </p>
                    </section>
                </div>
            </Card>
        </div>
    );
}
