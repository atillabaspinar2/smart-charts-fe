import React from "react";

export const PanelView: React.FC<{
  title: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ title, children, className = "" }) => {
  return (
    <section
      className={`rounded-md overflow-hidden bg-theme-bg border border-theme-primary shadow-[0_3px_8px_rgba(34,34,59,0.12)] ${className}`}
    >
      <header className="px-3 py-2 bg-theme-accent border-b border-theme-primary text-theme-bg">
        <h3 className="text-[11px] font-semibold tracking-wide uppercase text-theme-bg">
          {title}
        </h3>
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
};
