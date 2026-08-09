"use client";

import { useEffect, useState } from "react";
import { DEADLINE } from "@/lib/config";

type Parts = { days: number; hours: number; minutes: number };

function partsUntil(target: number, now: number): Parts {
  const ms = Math.max(0, target - now);
  const totalMinutes = Math.floor(ms / 60000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}

const numberClass =
  "tnum font-extrabold leading-[0.82] tracking-[-0.03em] " +
  "text-[clamp(3.4rem,15vw,6rem)]";

const colonClass =
  "tnum font-bold leading-[0.82] tracking-[-0.03em] text-colon " +
  "text-[clamp(2.2rem,9vw,4rem)] translate-y-[-0.06em]";

const labelClass =
  "mt-4 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-cool";

export default function Countdown() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(partsUntil(DEADLINE, Date.now()));
    tick();
    // Minute resolution — a per-second countdown is a stress test, not a clock.
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  const show = (n: number, padded: boolean) =>
    parts === null ? "––" : padded ? String(n).padStart(2, "0") : String(n);

  return (
    <div
      className="inline-grid grid-cols-[auto_auto_auto_auto_auto] items-baseline justify-items-center gap-x-[0.35em] sm:gap-x-[0.45em]"
      role="timer"
      aria-live="off"
      aria-label={
        parts
          ? `${parts.days} days, ${parts.hours} hours and ${parts.minutes} minutes remaining`
          : "Counting down"
      }
    >
      <span className={numberClass}>{show(parts?.days ?? 0, false)}</span>
      <span className={colonClass} aria-hidden="true">
        :
      </span>
      <span className={numberClass}>{show(parts?.hours ?? 0, true)}</span>
      <span className={colonClass} aria-hidden="true">
        :
      </span>
      <span className={numberClass}>{show(parts?.minutes ?? 0, true)}</span>

      <span className={labelClass}>days</span>
      <span aria-hidden="true" />
      <span className={labelClass}>hours</span>
      <span aria-hidden="true" />
      <span className={labelClass}>minutes</span>
    </div>
  );
}
