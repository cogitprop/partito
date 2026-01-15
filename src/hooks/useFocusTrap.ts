import { useRef, useEffect, RefObject } from "react";

/**
 * Hook to trap focus within a container element
 * Useful for modals, dialogs, and other overlay components
 *
 * @param isActive - Whether the focus trap is currently active
 * @returns A ref to attach to the container element
 */
export const useFocusTrap = <T extends HTMLElement>(isActive: boolean): RefObject<T | null> => {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    firstEl?.focus();
    container.addEventListener("keydown", handleKeyDown);

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return containerRef;
};
