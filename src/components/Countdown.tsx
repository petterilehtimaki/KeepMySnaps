"use client";

import { useEffect, useState } from "react";
import { DEADLINE } from "@/lib/config";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsUntil(target: number, now: number): Parts {
  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
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

export default function Countdown() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(partsUntil(DEADLINE, Date.now()));
    tick();
    // One second, now that there's a seconds column to move.
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const show = (n: number | undefined, padded: boolean) =>
    parts === null || n === undefined
      ? "––"
      : padded
        ? String(n).padStart(2, "0")
        : String(n);

  return (
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
            "until deletions can begin"
          : "Counting down"
      }
    >
      <span className={numberClass}>{show(parts?.days, false)}</span>
      <span className={colonClass} aria-hidden="true">
        :
      </span>
      <span className={numberClass}>{show(parts?.hours, true)}</span>
      <span className={colonClass} aria-hidden="true">
        :
      </span>
      <span className={numberClass}>{show(parts?.minutes, true)}</span>
      <span className={colonClass} aria-hidden="true">
        :
      </span>
      <span className={numberClass}>{show(parts?.seconds, true)}</span>

      <Label unit={UNITS[0]} />
      <span aria-hidden="true" />
      <Label unit={UNITS[1]} />
      <span aria-hidden="true" />
      <Label unit={UNITS[2]} />
      <span aria-hidden="true" />
      <Label unit={UNITS[3]} />
    </div>
  );
}
