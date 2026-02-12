import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="min-h-[calc(100vh-4rem)] flex flex-col">
                <div className="flex-1">
                    {children}
                </div>
                <Footer />
            </main>
        </>
    );
}
