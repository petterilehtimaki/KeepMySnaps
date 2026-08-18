"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  NotASnapchatExport,
  looksLikeZip,
  processExport,
  type Progress,
  type Summary,
} from "@/lib/process";
import { FREE_FILE_LIMIT, PRICE_LABEL } from "@/lib/config";
import { startCheckout, useUnlock } from "./useUnlock";
import { Button, Eyebrow, Section } from "./ui";

type State =
  | { kind: "idle" }
  /** Blocked before anything was opened. `count` is how many ZIPs were offered. */
  | { kind: "locked"; reason: "multi" | "used"; count: number }
  | { kind: "working"; progress: Progress }
  | { kind: "done"; summary: Summary; url: string }
  | { kind: "error"; message: string };

export default function Uploader() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);

  /**
   * Whether the one free run has been spent in this tab.
   *
   * The limit in process.ts applies per call, so without this a large export
   * — which Snapchat splits across several ZIPs — could be fed in one file at
   * a time for 20 free memories each. That isn't cunning, it's what a normal
   * person does when a drop looks like it stalled.
   *
   * Held in memory on purpose: a reload or a new tab clears it. Closing that
   * gap needs server-side identity, which would mean knowing who people are,
   * which is the one thing this site is built not to do.
   *
   * The ref is what `run` reads — a state value would be a stale closure —
   * and the state mirror only exists so the drop zone can mention it.
   */
  const freeRunUsedRef = useRef(false);
  const [freeRunUsed, setFreeRunUsed] = useState(false);

  const { status: unlockStatus, unlocked, settled } = useUnlock();

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const run = useCallback(
    async (files: File[]) => {
      const zips = files.filter(looksLikeZip);
      if (!zips.length) {
        setState({
          kind: "error",
          message:
            files.length === 1
              ? `“${files[0].name}” isn't a ZIP. We need the file Snapchat emailed you, still zipped.`
              : "None of those are ZIP files. We need the one Snapchat emailed you, still zipped.",
        });
        return;
      }

      // Settle the unlock check before anything else. It starts on mount so
      // it's almost always resolved by now, and deciding first means a
      // blocked drop never flashes "Opening the ZIP" at someone.
      const isUnlocked = await settled();

      // Both gates are free-tier only, and both answer before a single byte
      // is read: being turned away shouldn't cost you a five-gigabyte unzip.
      if (!isUnlocked) {
        if (freeRunUsedRef.current) {
          setState({ kind: "locked", reason: "used", count: zips.length });
          return;
        }
        if (zips.length > 1) {
          setState({ kind: "locked", reason: "multi", count: zips.length });
          return;
        }
      }

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        kind: "working",
        progress: {
          phase: "reading",
          done: 0,
          total: 1,
          label: "Opening the ZIP",
        },
      });

      try {
        const { blob, summary } = await processExport(zips, {
          limit: isUnlocked ? null : FREE_FILE_LIMIT,
          signal: controller.signal,
          onProgress: (progress) => setState({ kind: "working", progress }),
        });

        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        // Spent only once a run actually finishes. Dropping the wrong file
        // and getting an error shouldn't burn anybody's one free look.
        if (!isUnlocked) {
          freeRunUsedRef.current = true;
          setFreeRunUsed(true);
        }

        setState({ kind: "done", summary, url });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setState({ kind: "idle" });
          return;
        }
        setState({
          kind: "error",
          message:
            err instanceof NotASnapchatExport
              ? err.message
              : "Something fell over partway through. That one's on us — try again, and if it keeps happening the export is probably shaped in a way we haven't seen yet.",
        });
      } finally {
        abortRef.current = null;
      }
    },
    [settled],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length) void run(files);
    },
    [run],
  );

  const percent =
    state.kind === "working" && state.progress.total > 0
      ? Math.min(
          100,
          Math.round((state.progress.done / state.progress.total) * 100),
        )
      : 0;

  return (
    <Section id="upload" className="pb-24 sm:pb-32">
      <Eyebrow>Your export</Eyebrow>
      <h2 className="mt-4 max-w-[24ch] text-[clamp(1.5rem,3.2vw,2.125rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance">
        Drop the ZIP Snapchat sent you
      </h2>
      <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.65] text-muted-cool">
        It stays on this device. There is no upload step, no account, and no
        server holding your photos — the work happens in this tab.
      </p>

      <div className="mt-10">
        {state.kind === "idle" || state.kind === "error" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-[10px] border border-dashed px-6 py-16 text-center transition-colors ${
              dragging
                ? "border-blue bg-blue/[0.03]"
                : "border-hair bg-faint/60"
            }`}
          >
            <p className="text-[1.0625rem] font-bold tracking-[-0.015em]">
              Drag your export ZIP here
            </p>
            <p className="mx-auto mt-2 max-w-[40ch] text-[0.875rem] leading-[1.6] text-muted-cool">
              Several ZIPs is fine too — Snapchat splits big exports.
              Don&rsquo;t unzip them first.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) void run(files);
              }}
            />

            <Button
              className="mt-7"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              Choose file
            </Button>

            {state.kind === "error" && (
              <p className="mx-auto mt-7 max-w-[52ch] text-[0.875rem] leading-[1.6] font-semibold text-ink">
                {state.message}
              </p>
            )}

            {unlockStatus === "unlocked" && state.kind !== "error" && (
              <p className="mx-auto mt-7 max-w-[44ch] text-[0.8125rem] leading-[1.6] text-muted">
                Payment found — no file limit on this browser, and you can drop
                every ZIP in together. We kept the receipt, not the photos.
              </p>
            )}

            {freeRunUsed &&
              unlockStatus !== "unlocked" &&
              state.kind !== "error" && (
                <p className="mx-auto mt-7 max-w-[44ch] text-[0.8125rem] leading-[1.6] text-muted">
                  Free preview used. Unlocking processes everything you have, in
                  one go.
                </p>
              )}
          </div>
        ) : null}

        {state.kind === "locked" && (
          <LockedPanel
            reason={state.reason}
            count={state.count}
            onDismiss={() => setState({ kind: "idle" })}
          />
        )}

        {state.kind === "working" && (
          <div className="rounded-[10px] border border-hair px-6 py-16 text-center">
            <p className="text-[1.0625rem] font-bold tracking-[-0.015em]">
              {state.progress.label}
            </p>
            <p className="mt-2 text-[0.875rem] text-muted-cool">
              Leave this tab open. Closing it stops the work, because the work
              is this tab.
            </p>

            <div className="mx-auto mt-8 h-[3px] w-full max-w-md overflow-hidden rounded-full bg-hair">
              <div
                className="h-full rounded-full bg-blue transition-[width] duration-300"
                style={{ width: `${Math.max(3, percent)}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="mt-7 text-[0.8125rem] font-semibold text-muted-cool underline underline-offset-4 transition-colors hover:text-ink"
            >
              Stop
            </button>
          </div>
        )}

        {state.kind === "done" && (
          <Result
            summary={state.summary}
            url={state.url}
            unlocked={unlocked}
            onReset={() => setState({ kind: "idle" })}
          />
        )}
      </div>
    </Section>
  );
}

function Result({
  summary,
  url,
  unlocked,
  onReset,
}: {
  summary: Summary;
  url: string;
  unlocked: boolean;
  onReset: () => void;
}) {
  const facts = [
    { label: "Files", value: summary.filesWritten },
    { label: "Dates", value: summary.datesRestored },
    { label: "Locations", value: summary.gpsRestored },
    { label: "Captions", value: summary.overlaysMerged },
  ];

  return (
    <div className="rounded-[10px] border border-hair px-6 py-12 sm:px-10">
      <div className="text-center">
        <p className="text-[1.0625rem] font-bold tracking-[-0.015em]">
          {summary.filesWritten} memories, back in order
        </p>
        <p className="mx-auto mt-2 max-w-[46ch] text-[0.875rem] leading-[1.6] text-muted-cool">
          {summary.videos > 0
            ? `Including ${summary.videos} ${summary.videos === 1 ? "video" : "videos"} — those get the right filename and timestamp, since video files can't carry EXIF.`
            : "Every photo now carries its real capture date and location."}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="text-center">
            <p className="tnum text-[1.75rem] font-extrabold tracking-[-0.03em]">
              {fact.value}
            </p>
            <p className="mt-1.5 text-[0.75rem] font-semibold whitespace-nowrap uppercase tracking-[0.12em] text-muted-cool">
              {fact.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-11 flex flex-col items-center gap-3">
        <a
          href={url}
          download="keepmysnaps.zip"
          className="inline-flex h-12 w-full items-center justify-center rounded-[6px] bg-blue px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-blue-deep sm:w-auto"
        >
          Download the ZIP
        </a>
        <button
          type="button"
          onClick={onReset}
          className="text-[0.8125rem] font-semibold text-muted-cool underline underline-offset-4 transition-colors hover:text-ink"
        >
          Do another export
        </button>
      </div>

      {/*
        Shown on any locked run, not just one with a remainder: a small first
        ZIP can come out complete while three more sit in the downloads folder,
        and nothing inside an archive says the others exist.
      */}
      {!unlocked && <Paywall withheld={summary.withheld} />}
    </div>
  );
}

/**
 * The only place checkout is started from, so the blocked panel and the
 * post-run prompt can't drift apart in behaviour.
 */
function UnlockButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onBuy = async () => {
    setBusy(true);
    setError(null);
    const failure = await startCheckout();
    // On success the browser is already on its way to Stripe.
    if (failure) {
      setError(failure);
      setBusy(false);
    }
  };

  return (
    <>
      <Button className="mt-7" onClick={onBuy} disabled={busy} type="button">
        {busy ? "Opening checkout…" : `Unlock everything — ${PRICE_LABEL}`}
      </Button>

      {error && (
        <p className="mx-auto mt-5 max-w-[44ch] text-[0.8125rem] leading-[1.6] font-semibold text-ink">
          {error}
        </p>
      )}
    </>
  );
}

/** Shown in place of the drop zone when a free-tier drop is turned away. */
function LockedPanel({
  reason,
  count,
  onDismiss,
}: {
  reason: "multi" | "used";
  count: number;
  onDismiss: () => void;
}) {
  const multi = reason === "multi";

  return (
    <div className="rounded-[10px] border border-hair px-6 py-16 text-center">
      <p className="text-[1.0625rem] font-bold tracking-[-0.015em]">
        {multi
          ? `${count} export ZIPs at once`
          : "You’ve had the free preview"}
      </p>

      <p className="mx-auto mt-3 max-w-[48ch] text-[0.875rem] leading-[1.65] text-muted-cool">
        {multi
          ? `One at a time is the free tier. ${PRICE_LABEL} runs all ${count} together, with no limit on how many memories come out.`
          : `The first ${FREE_FILE_LIMIT} files are on the house, once. ${PRICE_LABEL} unlocks this export and every other ZIP Snapchat split it into, in full.`}
      </p>

      <UnlockButton />

      {multi && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onDismiss}
            className="text-[0.8125rem] font-semibold text-muted-cool underline underline-offset-4 transition-colors hover:text-ink"
          >
            Or drop a single ZIP to try it free
          </button>
        </div>
      )}

      <p className="mx-auto mt-7 max-w-[44ch] text-[0.75rem] leading-[1.6] text-muted-cool">
        {multi
          ? "Nothing was opened — those files haven't been read."
          : "Nothing was opened — that file hasn't been read."}
      </p>
    </div>
  );
}

function Paywall({ withheld }: { withheld: number }) {
  const remainder = withheld > 0;

  return (
    <div className="mt-12 border-t border-hair pt-10 text-center">
      <p className="text-[1.0625rem] font-bold tracking-[-0.015em]">
        {remainder
          ? `${withheld.toLocaleString()} more memories are waiting`
          : "Got more than one export ZIP?"}
      </p>
      <p className="mx-auto mt-2 max-w-[48ch] text-[0.875rem] leading-[1.65] text-muted-cool">
        {remainder
          ? `That's what's left in this one. ${PRICE_LABEL} unlocks the rest, and any other ZIPs Snapchat split your export into. Once, not monthly — we are not Snapchat.`
          : `Large exports arrive in several. ${PRICE_LABEL} runs all of them at once with no file limit. Once, not monthly — we are not Snapchat.`}
      </p>

      <UnlockButton />

      <p className="mx-auto mt-5 max-w-[40ch] text-[0.75rem] leading-[1.6] text-muted-cool">
        You&rsquo;ll come back here afterwards and drop your ZIPs in again — all
        of them this time. Nothing was kept while you were gone.
      </p>
    </div>
  );
}
