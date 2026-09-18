import { expect, test } from "bun:test";
import { WakeTouchGuard } from "../lib/wake-touch-guard";

test("wake blocks inputs for 500ms, then accepts a fresh tap", () => {
  const guard = new WakeTouchGuard();
  guard.start(1000);
  expect(guard.blocks("click", 1499)).toBe(true);
  expect(guard.blocks("pointerdown", 1500, 1)).toBe(false);
  expect(guard.blocks("pointerup", 1501, 1)).toBe(false);
  expect(guard.blocks("click", 1502, 1)).toBe(false);
});

test("held waking touch and its delayed click remain blocked after the deadline", () => {
  const guard = new WakeTouchGuard();
  guard.start(1000);
  expect(guard.blocks("pointerdown", 1200, 1)).toBe(true);
  expect(guard.blocks("pointermove", 2000, 1)).toBe(true);
  expect(guard.blocks("pointerup", 2100, 1)).toBe(true);
  expect(guard.blocks("mouseup", 2101)).toBe(true);
  expect(guard.blocks("click", 2400, 1)).toBe(true);
  expect(guard.blocks("pointerdown", 2500, 2)).toBe(false);
  expect(guard.blocks("click", 2510, 2)).toBe(false);
});

test("all fingers must lift, including cancelled pointers", () => {
  const guard = new WakeTouchGuard();
  guard.start(1000);
  guard.blocks("pointerdown", 1100, 1);
  guard.blocks("pointerdown", 1200, 2);
  expect(guard.blocks("pointerup", 1600, 1)).toBe(true);
  expect(guard.blocks("pointerdown", 1700, 3)).toBe(true);
  expect(guard.blocks("pointercancel", 1800, 2)).toBe(true);
  expect(guard.blocks("pointerup", 1900, 3)).toBe(true);
  expect(guard.blocks("pointerdown", 2000, 4)).toBe(false);
});

test("hidden page is guarded before visibility returns, and resume restarts the delay", () => {
  const guard = new WakeTouchGuard();
  guard.suspend();
  expect(guard.blocks("pointerdown", 10000, 1)).toBe(true);
  guard.start(10100);
  expect(guard.blocks("pointerup", 10200, 1)).toBe(true);
  expect(guard.blocks("keydown", 10599)).toBe(true);
  expect(guard.blocks("pointerdown", 10600, 2)).toBe(false);
});
