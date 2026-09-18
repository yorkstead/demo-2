import { expect, test } from "bun:test";
import { arrivalDeadline, formatArrivalEta } from "../lib/arrival-eta";

test("relative ETA uses the upper bound of the promised arrival window", () => {
  const created = "2026-09-08T18:00:00.000Z";
  for (const [eta, minutes] of [["15-20 Mins", 20], ["30 Mins", 30], ["45-60 Mins", 60]] as const) {
    expect(arrivalDeadline(eta, created)).toBe(Date.parse(created) + minutes * 60_000);
  }
  expect(arrivalDeadline(undefined, created)).toBeNull();
  expect(arrivalDeadline("Call dispatch", created)).toBeNull();
  expect(arrivalDeadline("30 Mins", "invalid")).toBeNull();
});

test("cutoff follows Denver time in summer, winter and DST transition days", () => {
  for (const [created, expected] of [
    ["2026-09-08T18:00:00Z", "2026-09-08T21:30:00Z"],
    ["2026-01-08T18:00:00Z", "2026-01-08T22:30:00Z"],
    ["2026-03-08T07:30:00Z", "2026-03-08T21:30:00Z"],
    ["2026-11-01T06:30:00Z", "2026-11-01T22:30:00Z"],
    // After cutoff, keep today's deadline rather than promising tomorrow.
    ["2026-09-09T01:00:00Z", "2026-09-08T21:30:00Z"],
  ]) expect(arrivalDeadline("Before 3:30 PM", created)).toBe(Date.parse(expected));
});

test("countdown progresses through due and overdue without a negative ETA", () => {
  const deadline = Date.parse("2026-09-08T18:30:00Z");
  expect(formatArrivalEta(deadline, deadline - 30 * 60_000)).toBe("In 30 min");
  expect(formatArrivalEta(deadline, deadline - 19 * 60_000)).toBe("In 19 min");
  expect(formatArrivalEta(deadline, deadline - 1)).toBe("In 1 min");
  expect(formatArrivalEta(deadline, deadline)).toBe("Due now");
  expect(formatArrivalEta(deadline, deadline + 59_999)).toBe("Due now");
  expect(formatArrivalEta(deadline, deadline + 5 * 60_000)).toBe("5 min overdue");
});
