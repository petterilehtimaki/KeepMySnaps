"use client";

import { useEffect, useState } from "react";
import { DEADLINE } from "@/lib/config";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

/**
 * Before the deadline this is a countdown. After it, it isn't — and a countdown
 * frozen at 0:00:00:00 under "Snapchat can start locking old memories in" reads as
 * a site nobody maintains, which is a bad look on the exact day the second
 * wave of visitors turns up.
 *
 * Decided in the browser rather than at build time: the pages are prerendered
 * before the date and there is no rebuild scheduled for it, so only the
 * visitor's clock can know which side of the line they're on. The initial
 * render is the neutral placeholder on both server and client, so there is no
 * hydration mismatch either side of midnight.
 */
type State =
  | { kind: "before"; parts: Parts }
  | { kind: "after"; days: number }
  | null;

function stateAt(now: number): Exclude<State, null> {
  if (now < DEADLINE) {
    const totalSeconds = Math.floor((DEADLINE - now) / 1000);
    return {
      kind: "before",
      parts: {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      },
    };
  }
  return { kind: "after", days: Math.floor((now - DEADLINE) / 86_400_000) };
}

const numberClass =
  "tnum font-extrabold leading-[0.82] tracking-[-0.03em] " +
  "text-[clamp(2.25rem,9.5vw,4.75rem)]";

const colonClass =
  "tnum font-bold leading-[0.82] tracking-[-0.03em] text-colon " +
  "text-[clamp(1.5rem,6vw,3rem)] translate-y-[-0.06em]";

const labelClass =
  "mt-4 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-cool " +
  "sm:text-[0.6875rem] sm:tracking-[0.18em]";

const eyebrowClass =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-muted";

/** Full words have room on desktop; four columns don't have it on a phone. */
const UNITS = [
  { short: "days", long: "days" },
  { short: "hrs", long: "hours" },
  { short: "mins", long: "minutes" },
  { short: "secs", long: "seconds" },
] as const;

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

function Label({ unit }: { unit: (typeof UNITS)[number] }) {
  return (
    <span className={labelClass}>
      <span className="sm:hidden">{unit.short}</span>
      <span className="hidden sm:inline">{unit.long}</span>
    </span>
  );
}

function Eyebrow({ state }: { state: State }) {
  return (
    <p className={eyebrowClass}>
      {state?.kind === "after"
        ? "Snapchat can now lock old memories over 5GB"
        : "Snapchat can start locking old memories in"}
    </p>
  );
}

export default function Countdown({
  withEyebrow = false,
}: {
  /** Render the line above the numbers too, so it flips with them. */
  withEyebrow?: boolean;
}) {
  const [state, setState] = useState<State>(null);

  useEffect(() => {
    const tick = () => setState(stateAt(Date.now()));
    tick();
    // Every second while there are seconds to count; once the deadline has
    // passed the only thing that changes is the day, so a minute is plenty.
    const id = window.setInterval(tick, Date.now() < DEADLINE ? 1000 : 60_000);
    return () => window.clearInterval(id);
  }, []);

  const after = state?.kind === "after" ? state : null;
  const parts = state?.kind === "before" ? state.parts : null;

  const body = after ? (
    <div
      className="inline-flex flex-col items-center"
      role="status"
      aria-label={
        after.days === 0
          ? "Archiving can begin from today"
          : `Archiving has been allowed for ${plural(after.days, "day")}`
      }
    >
      <span className={numberClass}>
        {after.days === 0 ? "Today" : after.days}
      </span>
      <span className={labelClass}>
        {after.days === 0
          ? "locking can begin"
          : `${after.days === 1 ? "day" : "days"} since locking could begin`}
      </span>
    </div>
  ) : (
    <div
      className="inline-grid grid-cols-[auto_auto_auto_auto_auto_auto_auto] items-baseline justify-items-center gap-x-[0.22em] sm:gap-x-[0.3em]"
      role="timer"
      // Left off deliberately: announcing a fresh string every second would
      // make a screen reader unusable.
      aria-live="off"
      aria-label={
        parts
          ? `${plural(parts.days, "day")}, ${plural(parts.hours, "hour")}, ` +
            `${plural(parts.minutes, "minute")} and ${plural(parts.seconds, "second")} ` +
            "until archiving can begin"
          : "Counting down"
      }
    >
      {(["days", "hours", "minutes", "seconds"] as const).map((key, i) => (
        <FragmentCell
          key={key}
          value={
            parts === null
              ? "––"
              : i === 0
                ? String(parts[key])
                : String(parts[key]).padStart(2, "0")
          }
          last={i === 3}
        />
      ))}
      {UNITS.map((unit, i) => (
        <FragmentLabel key={unit.long} unit={unit} last={i === 3} />
      ))}
    </div>
  );

  if (!withEyebrow) return body;
  return (
    <>
      <Eyebrow state={state} />
      <div className="mt-8 sm:mt-10">{body}</div>
    </>
  );
}

function FragmentCell({ value, last }: { value: string; last: boolean }) {
  return (
    <>
      <span className={numberClass}>{value}</span>
      {!last && (
        <span className={colonClass} aria-hidden="true">
          :
        </span>
      )}
    </>
  );
}

function FragmentLabel({
  unit,
  last,
}: {
  unit: (typeof UNITS)[number];
  last: boolean;
}) {
  return (
    <>
      <Label unit={unit} />
      {!last && <span aria-hidden="true" />}
    </>
  );
}
