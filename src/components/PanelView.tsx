import React from "react";

export const PanelView: React.FC<{
  title: string;
  children?: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}> = ({ title, children, className = "", headerRight }) => {
  return (
    <section
      className={`rounded-md overflow-visible bg-theme-bg border border-theme-primary shadow-[0_3px_8px_rgba(34,34,59,0.12)] ${className}`}
    >
      <header className="px-3 py-2 bg-theme-accent border-b border-theme-primary text-theme-bg flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold tracking-wide uppercase text-theme-bg">
          {title}
        </h3>
        {headerRight}
      </header>
      <div className="p-2">{children}</div>
    </section>
  );
};
