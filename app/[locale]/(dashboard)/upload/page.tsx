// This is the Server Component wrapper for the Upload page.
// It fetches recent uploads from Supabase and passes them to the client component.

import { createClient } from '@/lib/supabase/server';
import UploadPageClient from './UploadPageClient';
import type { UploadRow } from '@/types/database';

async function getRecentUploads(userId: string): Promise<UploadRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  return (data ?? []) as UploadRow[];
}
export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const recentUploads = user ? await getRecentUploads(user.id) : [];

  return <UploadPageClient recentUploads={recentUploads} />;
}
