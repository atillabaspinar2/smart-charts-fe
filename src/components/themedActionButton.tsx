import type { CSSProperties } from "react";

type ThemedActionButtonProps = {
  color: string;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ThemedActionButton: React.FC<ThemedActionButtonProps> = ({
  color,
  children,
  className = "",
  style,
  ...props
}) => {
  const themedStyle: CSSProperties = {
    borderColor: color,
    color,
    ...style,
  };

  return (
    <button
      className={`h-9 px-4 rounded-full border bg-white/10 font-semibold shadow-sm transition hover:scale-105 ${className}`}
      style={themedStyle}
      {...props}
    >
      {children}
    </button>
  );
};
