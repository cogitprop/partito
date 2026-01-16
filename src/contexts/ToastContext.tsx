import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { Icon } from "@/components/partito/Icon";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastItem = ({ message, type, onClose }: { message: string; type: Toast["type"]; onClose: () => void }) => {
  const icons: Record<Toast["type"], { name: string; className: string }> = {
    success: { name: "check-circle", className: "text-sage" },
    error: { name: "x-circle", className: "text-error" },
    warning: { name: "alert-triangle", className: "text-honey" },
    info: { name: "info", className: "text-sky" },
  };

  const icon = icons[type] || icons.info;

  return (
    <div
      role="alert"
      className="bg-warm-gray-900 text-white px-5 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in-right"
    >
      <Icon name={icon.name} size={20} className={`${icon.className} flex-shrink-0`} />
      <span className="flex-1 text-sm">{message}</span>
      <button
        onClick={onClose}
        className="text-warm-gray-500 hover:text-white p-1 flex items-center justify-center transition-colors"
        aria-label="Close notification"
      >
        <Icon name="x" size={18} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // FIX: Track timeout IDs to clear them when toasts are manually removed
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    // FIX: Use .substring() instead of deprecated .substr()
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);

    const duration = type === "error" ? null : type === "warning" ? 8000 : 5000;
    if (duration) {
      const timeoutId = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        // Clean up the timeout reference
        timeoutRefs.current.delete(id);
      }, duration);
      // Store the timeout ID so we can clear it if toast is manually removed
      timeoutRefs.current.set(id, timeoutId);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    // FIX: Clear the auto-dismiss timeout when manually removing a toast
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-3 z-[1000] max-w-[400px]" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
