type ThemedActionButtonProps = {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ThemedActionButton: React.FC<ThemedActionButtonProps> = ({
  children,
  className = "",
  style,
  ...props
}) => {
  return (
    <button
      className={`h-9 px-4 rounded-full border border-theme-bg bg-white/10 text-theme-bg font-semibold shadow-sm transition hover:scale-105 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
