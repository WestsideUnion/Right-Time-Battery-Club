'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function searchReceipts(formData: FormData) {
    const query = formData.get('query')?.toString();
    if (query) {
        redirect(`/admin?q=${encodeURIComponent(query)}`);
    } else {
        redirect('/admin');
    }
}

export async function deleteReceipt(receiptId: string) {
    const supabase = await createClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: membership } = await supabase
        .from('shop_members')
        .select('role')
        .eq('user_id', user.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!membership || (membership as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

    if (error) throw error;

    revalidatePath('/admin');
    redirect('/admin');
}
