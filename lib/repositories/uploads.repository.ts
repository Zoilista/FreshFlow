// ─── Uploads Repository ──────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server';
import type { UploadRow, UploadInsert, UploadUpdate } from '@/types/database';

export async function createUpload(data: UploadInsert): Promise<UploadRow> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from('uploads')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`createUpload: ${error.message}`);
  return row as UploadRow;
}

export async function updateUpload(id: string, data: UploadUpdate): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('uploads')
    .update(data)
    .eq('id', id);
  if (error) throw new Error(`updateUpload: ${error.message}`);
}

export async function getLatestUpload(userId: string): Promise<UploadRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestUpload: ${error.message}`);
  return data as UploadRow | null;
}

export async function getRecentUploads(userId: string, limit = 5): Promise<UploadRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getRecentUploads: ${error.message}`);
  return (data ?? []) as UploadRow[];
}

export async function countUploads(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('uploads')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');
  if (error) throw new Error(`countUploads: ${error.message}`);
  return count ?? 0;
}

export async function findDuplicateUpload(
  userId: string,
  contentHash: string,
): Promise<UploadRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .eq('content_hash', contentHash)
    .eq('status', 'completed')
    .maybeSingle();
  if (error) throw new Error(`findDuplicateUpload: ${error.message}`);
  return data as UploadRow | null;
}
