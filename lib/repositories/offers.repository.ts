// ─── Offers Repository ──────────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server';
import type { OfferRow, OfferInsert, OfferStatus } from '@/types/database';

/** Fetch all offers for a user, newest first */
export async function getOffers(userId: string): Promise<OfferRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(`getOffers: ${error.message}`);
  return (data ?? []) as OfferRow[];
}

/** Create a new offer */
export async function createOffer(offer: OfferInsert): Promise<OfferRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .insert(offer)
    .select()
    .single();
    
  if (error) throw new Error(`createOffer: ${error.message}`);
  return data as OfferRow;
}

/** Update an offer's status */
export async function updateOfferStatus(
  offerId: string, 
  userId: string, 
  status: OfferStatus
): Promise<OfferRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', offerId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw new Error(`updateOfferStatus: ${error.message}`);
  return data as OfferRow;
}

/** Delete an offer */
export async function deleteOffer(offerId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', offerId)
    .eq('user_id', userId);
    
  if (error) throw new Error(`deleteOffer: ${error.message}`);
}
