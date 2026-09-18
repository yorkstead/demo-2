/**
 * Offline queue manager for Forklift & Dock terminals.
 * Staged submissions, photos, and signatures survive browser reloads and network drops.
 */

export interface QueuedJobSubmission {
  id: string;
  queuedAt: string;
  sessionId: string;
  payload: any;
  retryCount: number;
  lastError?: string;
}

const STORAGE_KEY = "reworkflow_offline_queue_v1";

export class OfflineQueue {
  static getQueue(): QueuedJobSubmission[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveQueue(queue: QueuedJobSubmission[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      // Dispatch custom event so UI components can react instantly
      window.dispatchEvent(new CustomEvent("rework-offline-queue-change", { detail: queue }));
    } catch (e) {
      console.warn("Failed to persist offline queue:", e);
    }
  }

  static enqueue(sessionId: string, payload: any): QueuedJobSubmission {
    const queue = this.getQueue();
    const entry: QueuedJobSubmission = {
      id: `OFF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      queuedAt: new Date().toISOString(),
      sessionId,
      payload,
      retryCount: 0,
    };
    queue.push(entry);
    this.saveQueue(queue);
    return entry;
  }

  static dequeue(id: string): void {
    const queue = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
  }

  static getPendingCount(): number {
    return this.getQueue().length;
  }

  /**
   * Attempts to drain all queued jobs to the backend API.
   * Resolves with { synced: number, remaining: number }
   */
  static async processQueue(): Promise<{ synced: number; remaining: number }> {
    if (typeof window === "undefined") return { synced: 0, remaining: 0 };
    if (!navigator.onLine) return { synced: 0, remaining: this.getPendingCount() };

    const queue = this.getQueue();
    if (queue.length === 0) return { synced: 0, remaining: 0 };

    let synced = 0;
    const remainingQueue: QueuedJobSubmission[] = [];

    for (const item of queue) {
      try {
        const res = await fetch(`/api/jobs?session=${encodeURIComponent(item.sessionId)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": item.sessionId,
          },
          body: JSON.stringify(item.payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          synced++;
        } else {
          item.retryCount++;
          item.lastError = data.error || "Submission failed";
          remainingQueue.push(item);
        }
      } catch (err: any) {
        item.retryCount++;
        item.lastError = err?.message || "Network unreachable";
        remainingQueue.push(item);
      }
    }

    this.saveQueue(remainingQueue);
    return { synced, remaining: remainingQueue.length };
  }
}