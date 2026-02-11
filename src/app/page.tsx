import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--brand-gold)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-[var(--brand-blue)]/20 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-[var(--brand-gold)] mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Warranty Tracking Made Simple
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Your Watch Battery
              <br />
              <span className="bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold-light)] bg-clip-text text-transparent">
                Warranty Vault
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--brand-slate)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your receipt, track your warranty, and never lose a
              battery service record again. Secure, simple, and automatic.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold-light)] text-[var(--brand-navy)] font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--brand-gold)]/20 transition-all duration-200 hover:scale-[1.02]"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-[var(--brand-slate)] hover:text-white glass rounded-xl transition-all duration-200"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-16">
            Three Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Receipt',
                desc: 'Snap a photo of your battery service receipt and upload it securely.',
                icon: '📤',
              },
              {
                step: '02',
                title: 'Confirm Details',
                desc: 'Review the extracted watch model, brand, and service date. Edit if needed.',
                icon: '✅',
              },
              {
                step: '03',
                title: 'Track Warranty',
                desc: 'Access your warranty status anytime. Get notified before expiry.',
                icon: '⏱️',
              },
            ].map((item) => (
              <div key={item.step} className="glass p-8 text-center group hover:glow-gold transition-all duration-300">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-[var(--brand-gold)] tracking-widest mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-[var(--brand-slate)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Banner */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="glass p-8 sm:p-12 text-center glow-gold">
            <h2 className="text-2xl font-bold text-white mb-4">🔒 Your Data is Secure</h2>
            <p className="text-[var(--brand-slate)] max-w-xl mx-auto leading-relaxed">
              End-to-end encryption, no password required. Sign in with a secure email link.
              Your receipt photos are automatically deleted after 13 months for your privacy.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-[var(--brand-slate)]">
            © {new Date().getFullYear()} Right Time Inc. All rights reserved.
          </div>
        </footer>
      </main>
    </>
  );
}
