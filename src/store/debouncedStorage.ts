import { StateStorage } from 'zustand/middleware';

// Memory cache prevents repetitive parsing and main-thread synchronous blocking
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const memoryStore: Record<string, string> = {};

export const debouncedLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (name in memoryStore) {
      return memoryStore[name];
    }
    try {
      const value = localStorage.getItem(name);
      if (value !== null) {
        memoryStore[name] = value;
      }
      return value;
    } catch (e) {
      console.warn('[Storage] Failed to read from localStorage:', e);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    memoryStore[name] = value;

    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    // Debounce writes to avoid frame drops during rapid card reviews
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        console.error('[Storage] Failed to write to localStorage:', e);
      }
    }, 350);
  },

  removeItem: (name: string): void => {
    delete memoryStore[name];
    try {
      localStorage.removeItem(name);
    } catch (e) {
      console.warn('[Storage] Failed to remove item from localStorage:', e);
    }
  },
};
