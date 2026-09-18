export const WAKE_GUARD_MS = 500;

/** Keep the entire waking gesture blocked, including its compatibility click. */
export class WakeTouchGuard {
  private until = 0;
  private pointers = new Set<number>();
  private swallowTail = false;

  start(now: number) { this.until = now + WAKE_GUARD_MS; }
  suspend() { this.until = Infinity; }

  blocks(type: string, now: number, pointerId = 0): boolean {
    const active = now < this.until || this.pointers.size > 0;
    if (type === "pointerdown") {
      if (active) this.pointers.add(pointerId);
      else this.swallowTail = false;
      return active;
    }
    if (type === "pointerup" || type === "pointercancel") {
      const blocked = active || this.pointers.has(pointerId);
      this.pointers.delete(pointerId);
      if (blocked) this.swallowTail = true;
      return blocked;
    }
    // Mouse/touch compatibility events can arrive after pointerup. Require a
    // fresh pointerdown before accepting another pointer-generated action.
    if (/^(click|dblclick|contextmenu|mouse|touch|pointer)/.test(type)) {
      return active || this.swallowTail;
    }
    return active;
  }
}

export function installWakeTouchGuard(target: Window) {
  const guard = new WakeTouchGuard();
  const events = ["pointerdown", "pointermove", "pointerup", "pointercancel",
    "mousedown", "mousemove", "mouseup", "touchstart", "touchmove", "touchend",
    "touchcancel", "click", "dblclick", "contextmenu", "wheel", "keydown", "keyup"];
  const capture = (event: Event) => {
    if (guard.blocks(event.type, target.performance.now(), (event as PointerEvent).pointerId)) {
      if (event.cancelable) event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  events.forEach((event) => target.addEventListener(event, capture, { capture: true, passive: false }));
  return {
    start: () => guard.start(target.performance.now()),
    suspend: () => guard.suspend(),
    dispose: () => events.forEach((event) => target.removeEventListener(event, capture, true)),
  };
}
