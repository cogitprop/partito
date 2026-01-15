import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  hideClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  hideClose = false,
}) => {
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-[400px]",
    md: "max-w-[500px]",
    lg: "max-w-[640px]",
    xl: "max-w-[800px]",
  };

  // Generate a unique ID for the modal title
  const modalTitleId = title ? "modal-title" : undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]",
        !reducedMotion && "animate-fade-in",
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        // FIX: Only set aria-labelledby when title exists
        aria-labelledby={modalTitleId}
        className={cn(
          "bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-auto",
          sizes[size],
          !reducedMotion && "animate-slide-in-up",
        )}
      >
        {(title || (showClose && !hideClose)) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-warm-gray-100">
            {title && (
              <h2 id={modalTitleId} className="text-xl font-semibold font-heading text-warm-gray-900">
                {title}
              </h2>
            )}
            {showClose && !hideClose && (
              <button
                onClick={onClose}
                className="text-warm-gray-500 hover:bg-warm-gray-50 p-2 rounded-md flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <Icon name="x" size={24} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
