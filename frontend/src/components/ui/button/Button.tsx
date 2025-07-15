import React, { forwardRef, memo, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const styles = {
  base: "rounded-xl font-medium focus:outline-none transition duration-200",
  variants: {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
  },
  sizes: {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  },
};

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        children,
        variant = "primary",
        size = "md",
        disabled,
        className,
        ...props
      },
      ref,
    ) => (
      <button
        ref={ref}
        type="button"
        className={clsx(
          styles.base,
          styles.variants[variant],
          styles.sizes[size],
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    ),
  ),
);

Button.displayName = "Button";
