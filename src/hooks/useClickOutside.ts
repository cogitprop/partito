import { useRef, useEffect, RefObject } from "react";

/**
 * Hook to detect clicks outside of a referenced element
 *
 * IMPORTANT: The callback should be memoized with useCallback to prevent
 * unnecessary effect re-runs. If the callback isn't memoized, it will
 * cause the event listener to be re-attached on every render.
 *
 * Example usage:
 * ```tsx
 * const handleClose = useCallback(() => setOpen(false), []);
 * const ref = useClickOutside<HTMLDivElement>(handleClose);
 * ```
 */
export const useClickOutside = <T extends HTMLElement>(callback: () => void): RefObject<T | null> => {
  const ref = useRef<T | null>(null);
  // Store callback in a ref to avoid re-subscribing on every render
  const callbackRef = useRef(callback);

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callbackRef.current();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []); // Empty deps - only runs once, uses ref for callback

  return ref;
};
