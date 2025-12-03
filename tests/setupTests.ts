// Vitest setup: polyfill IndexedDB for Node test environment
import 'fake-indexeddb/auto';

// Ensure globalThis has localStorage/sessionStorage when using non-jsdom environments
if (typeof globalThis.localStorage === 'undefined') {
  // Minimal in-memory storage for tests
  class MemoryStorage {
    private store: Record<string, string> = {};
    getItem(key: string) { return this.store[key] ?? null; }
    setItem(key: string, value: string) { this.store[key] = String(value); }
    removeItem(key: string) { delete this.store[key]; }
    clear() { this.store = {}; }
  }
  // @ts-ignore
  globalThis.localStorage = new MemoryStorage();
  // @ts-ignore
  globalThis.sessionStorage = new MemoryStorage();
}
