import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The record of who has paid.
 *
 * Reached with the Supabase *secret* key, which bypasses RLS — the `unlocks`
 * table denies anon and authenticated outright (see
 * supabase/migrations/0001_create_unlocks.sql). Nothing here is ever exposed
 * to the browser.
 */

export type UnlockRecord = {
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  amount_total: number;
  currency: string;
  redemption_count: number;
};

const TABLE = "unlocks";

export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Fast path: has this session already been verified with Stripe once before?
 * Also bumps the redemption counter, which is the only signal we get that a
 * session id is doing the rounds.
 */
export async function findUnlock(
  db: SupabaseClient,
  sessionId: string,
): Promise<UnlockRecord | null> {
  const { data, error } = await db
    .from(TABLE)
    .select("stripe_session_id, stripe_payment_intent, amount_total, currency, redemption_count")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const record = data as UnlockRecord;

  await db
    .from(TABLE)
    .update({
      last_redeemed_at: new Date().toISOString(),
      redemption_count: record.redemption_count + 1,
    })
    .eq("stripe_session_id", sessionId);

  return record;
}

export async function recordUnlock(
  db: SupabaseClient,
  record: Omit<UnlockRecord, "redemption_count">,
): Promise<void> {
  const { error } = await db.from(TABLE).upsert(
    {
      ...record,
      last_redeemed_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true },
  );

  if (error) throw error;
}
