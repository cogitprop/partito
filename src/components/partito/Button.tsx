import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg cursor-pointer transition-all duration-150 outline-none disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2";

    const sizeStyles = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-8 py-4 text-lg h-14",
    };

    const variantStyles = {
      primary:
        "bg-sage text-white border-none hover:bg-sage-light hover:shadow-md hover:scale-[1.02] active:bg-sage-dark active:scale-[0.98]",
      secondary:
        "bg-transparent border-2 border-warm-gray-300 text-warm-gray-700 hover:bg-cream-dark hover:border-sage active:bg-warm-gray-100",
      ghost: "bg-transparent border-none text-sage-dark hover:bg-sage/10 active:bg-sage/15",
      destructive:
        "bg-error text-white border-none hover:bg-error/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], fullWidth && "w-full", className)}
        {...props}
      >
        {loading ? (
          <>
            <Icon name="loader" size={16} className="animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

export { Button };
