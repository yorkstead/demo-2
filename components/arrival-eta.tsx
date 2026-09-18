"use client";

import { useSyncExternalStore } from "react";
import { arrivalDeadline, formatArrivalEta } from "@/lib/arrival-eta";

// One clock for all visible reservations. Only the labels rerender on each tick.
const listeners = new Set<() => void>();
let clock = 0;
let timer: ReturnType<typeof setInterval> | undefined;
function tick() {
  clock = Date.now();
  listeners.forEach((notify) => notify());
}
function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1) {
    timer = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    tick();
  }
  return () => {
    listeners.delete(notify);
    if (!listeners.size) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    }
  };
}
const getSnapshot = () => clock;
const getServerSnapshot = () => 0;

export function ArrivalEta({ eta, createdAt }: { eta?: string; createdAt: string }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const deadline = arrivalDeadline(eta, createdAt);
  if (deadline === null) return <span>{eta || "Not provided"}</span>;
  return (
    <span
      title="Driver-provided estimate; counts down from the reservation time. Not live traffic tracking."
      className={now > deadline ? "text-amber-400" : undefined}
    >
      {now ? formatArrivalEta(deadline, now) : eta}
    </span>
  );
}
