import type { ButtonHTMLAttributes, FC } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-theme-accent text-theme-bg border border-theme-accent hover:bg-theme-strong hover:border-theme-strong",
  secondary:
    "bg-theme-bg text-theme-text border border-theme-primary hover:bg-theme-surface",
  ghost:
    "bg-transparent text-theme-text border border-transparent hover:bg-theme-bg",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export const CustomButton: FC<CustomButtonProps> = ({
  variant = "primary",
  size = "sm",
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
