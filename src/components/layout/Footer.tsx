import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-6 text-center text-xs text-[var(--brand-slate)] space-x-4 opacity-50 hover:opacity-100 transition-opacity">
            <Link href="/privacy" className="hover:text-[var(--brand-gold)] transition-colors">
                Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--brand-gold)] transition-colors">
                Terms of Service
            </Link>
        </footer>
    );
}
