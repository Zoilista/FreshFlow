'use server';

import { createOffer, updateOfferStatus, deleteOffer } from '@/lib/repositories/offers.repository';
import type { OfferInsert, OfferStatus } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function createOfferAction(offer: OfferInsert) {
  try {
    const result = await createOffer(offer);
    revalidatePath('/offers');
    revalidatePath('/surplus');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateOfferStatusAction(offerId: string, userId: string, status: OfferStatus) {
  try {
    const result = await updateOfferStatus(offerId, userId, status);
    revalidatePath('/offers');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteOfferAction(offerId: string, userId: string) {
  try {
    await deleteOffer(offerId, userId);
    revalidatePath('/offers');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
