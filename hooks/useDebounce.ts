/**
 * Delays updating a value until the user stops changing it.
 * Useful for search inputs to avoid firing API calls on every keystroke.
 */
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
