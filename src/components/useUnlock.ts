"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UNLOCK_STORAGE_KEY } from "@/lib/config";

export type UnlockStatus = "checking" | "locked" | "unlocked";

/**
 * Asks the server whether this visitor has paid.
 *
 * What's kept in the browser is a Stripe Checkout session id, not a flag. It
 * gets re-verified against Stripe on every load, so editing localStorage by
 * hand gains you nothing — you'd need an id belonging to a real completed
 * payment, and those only ever go to the person who made it.
 *
 * The answer has three values, not two. "paid" and "not-paid" are Stripe's
 * word. "unknown" is everything else — a dropped connection, a timeout, the
 * server or Stripe having a bad minute, a payment method that settles later —
 * and it must never be treated as "not-paid", because the response to
 * "not-paid" is forgetting the id, and a forgotten id is a customer who paid
 * and can't get back in.
 */
type Verdict = "paid" | "not-paid" | "unknown";

async function verify(sessionId: string): Promise<Verdict> {
  try {
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return "unknown";
    const data = (await res.json()) as { unlocked?: boolean; pending?: boolean };
    if (data.unlocked === true) return "paid";
    return data.pending ? "unknown" : "not-paid";
  } catch {
    return "unknown";
  }
}

/**
 * A lagging request shouldn't lock a paid visitor out for the whole visit, so
 * unknowns get two more tries a few seconds apart. Definite answers don't.
 */
async function verifyWithRetry(sessionId: string): Promise<Verdict> {
  let verdict: Verdict = "unknown";
  for (const delay of [0, 1500, 4000]) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    verdict = await verify(sessionId);
    if (verdict !== "unknown") break;
  }
  return verdict;
}

// localStorage can throw outright (storage disabled, some private modes), so
// every touch is wrapped rather than letting one exception wedge the check.
function readStored(): string | null {
  try {
    return window.localStorage.getItem(UNLOCK_STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(sessionId: string): boolean {
  try {
    window.localStorage.setItem(UNLOCK_STORAGE_KEY, sessionId);
    return true;
  } catch {
    return false;
  }
}

function forget() {
  try {
    window.localStorage.removeItem(UNLOCK_STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage isn't there.
  }
}

function stripSessionFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("session_id")) return;
  url.searchParams.delete("session_id");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

async function checkStored(sessionId: string): Promise<boolean> {
  const verdict = await verifyWithRetry(sessionId);
  // Only a definite "no" clears it. An unknown is kept for the next load.
  if (verdict === "not-paid") forget();
  return verdict === "paid";
}

async function resolveUnlock(): Promise<boolean> {
  const fromUrl = new URLSearchParams(window.location.search).get("session_id");
  const stored = readStored();

  if (!fromUrl) return stored ? checkStored(stored) : false;

  // A fresh id from Stripe's redirect is saved before it's checked, not after.
  // If the check fails, or the page is refreshed while it's running, the id
  // has to survive somewhere — and since it's re-verified on every load,
  // keeping an unverified one costs nothing.
  const saved = store(fromUrl);
  const verdict = await verifyWithRetry(fromUrl);

  if (verdict === "not-paid") {
    stripSessionFromUrl();
    // A bad link mustn't cost someone an earlier, genuine unlock.
    if (stored && stored !== fromUrl) {
      store(stored);
      return checkStored(stored);
    }
    forget();
    return false;
  }

  // Paid, or not known yet. Either way the id is in storage now, so tidy the
  // address bar so it isn't copied into a group chat — unless the browser
  // refused to store it, in which case the URL is the only copy there is.
  if (saved) stripSessionFromUrl();
  return verdict === "paid";
}

export function useUnlock() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const pendingRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const promise = resolveUnlock();
    pendingRef.current = promise;
    void promise.then((ok) => {
      if (!cancelled) setUnlocked(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Awaits the in-flight check. Dropping a ZIP a fraction of a second after
   * the page loads shouldn't quietly bill someone the 20-file limit.
   */
  const settled = useCallback(async (): Promise<boolean> => {
    return (await pendingRef.current) ?? false;
  }, []);

  const status: UnlockStatus =
    unlocked === null ? "checking" : unlocked ? "unlocked" : "locked";

  return { status, unlocked: unlocked === true, settled };
}

/** Starts a Stripe Checkout session and sends the browser to it. */
export async function startCheckout(): Promise<string | null> {
  try {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      return data.error ?? "Couldn't start checkout. Try again in a moment.";
    }
    window.location.href = data.url;
    return null;
  } catch {
    return "Couldn't reach the checkout. Check your connection and try again.";
  }
}
