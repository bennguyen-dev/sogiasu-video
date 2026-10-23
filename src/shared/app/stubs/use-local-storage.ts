import { useCallback, useEffect, useState } from "react";
import type { LocalStorageKey } from "@/shared/constants/local-storage";

// the app's useLocalStorage, kept in this tab's memory: render tabs share the browser's storage,
// so a value one tab writes for a late frame would leak into another tab's early frames
const store = new Map<string, unknown>();
const bus = new EventTarget();

export function useLocalStorage<T>(key: LocalStorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(() => (store.has(key) ? (store.get(key) as T) : initialValue));

  useEffect(() => {
    const read = () => setValue(store.has(key) ? (store.get(key) as T) : initialValue);
    bus.addEventListener(key, read);
    return () => bus.removeEventListener(key, read);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = store.has(key) ? (store.get(key) as T) : initialValue;
      store.set(key, next instanceof Function ? next(prev) : next);
      bus.dispatchEvent(new Event(key));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, set] as const;
}
