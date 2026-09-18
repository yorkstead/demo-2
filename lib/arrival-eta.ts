/** Resolve the latest expected arrival from the reservation's original timestamp. */
export function arrivalDeadline(eta: string | undefined, createdAt: string): number | null {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created) || !eta) return null;
  const minutes = eta.match(/^(\d+)(?:\s*-\s*(\d+))?\s*(?:mins?|minutes?)$/i);
  if (minutes) return created + Number(minutes[2] || minutes[1]) * 60_000;
  if (eta !== "Before 3:30 PM") return null;

  // Resolve Denver's cutoff on the reservation date, independent of the device
  // timezone. Use the offset at the cutoff so DST transition days work too.
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  const parts = (time: number) => Object.fromEntries(
    formatter.formatToParts(time).map(({ type, value }) => [type, Number(value)]),
  );
  const date = parts(created);
  const nominal = Date.UTC(date.year, date.month - 1, date.day, 15, 30);
  const local = parts(nominal);
  const offset = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second) - nominal;
  return nominal - offset;
}

export function formatArrivalEta(deadline: number, now: number): string {
  const remaining = deadline - now;
  if (remaining > 0) return `In ${Math.ceil(remaining / 60_000)} min`;
  if (remaining > -60_000) return "Due now";
  return `${Math.floor(-remaining / 60_000)} min overdue`;
}
