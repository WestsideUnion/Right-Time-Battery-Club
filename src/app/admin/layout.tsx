import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Check if user is a shop admin
    const { data: membershipData } = await supabase
        .from('shop_members')
        .select('id, role')
        .eq('user_id', user.id)
        .maybeSingle();

    const membership = membershipData as { id: string; role: string } | null;

    if (!membership || membership.role !== 'admin') redirect('/dashboard');

    return (
        <>
            <Header />
            <div className="flex min-h-[calc(100vh-4rem)]">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8">{children}</main>
            </div>
        </>
    );
}
