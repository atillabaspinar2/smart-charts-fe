import React from "react";

export const PanelView: React.FC<{
  title: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  headerRight?: React.ReactNode;
  onHeaderMouseDown?: (e: React.MouseEvent<HTMLElement>) => void;
  hideBody?: boolean;
  bodyClassName?: string;
}> = ({
  title,
  children,
  className = "",
  style,
  headerRight,
  onHeaderMouseDown,
  hideBody = false,
  bodyClassName = "",
}) => {
  return (
    <section
      style={style}
      className={`rounded-md overflow-visible bg-theme-bg border border-theme-primary shadow-[0_3px_8px_rgba(34,34,59,0.12)] ${className}`}
    >
      <header
        className={`min-h-10 px-3 py-2 bg-theme-accent border-b border-theme-primary text-theme-bg flex items-center justify-between gap-2 ${
          onHeaderMouseDown ? "cursor-ns-resize select-none" : ""
        }`}
        onMouseDown={onHeaderMouseDown}
      >
        <h3 className="text-[11px] font-semibold tracking-wide uppercase text-theme-bg">
          {title}
        </h3>
        {headerRight}
      </header>
      {!hideBody && <div className={`p-2 ${bodyClassName}`}>{children}</div>}
    </section>
  );
};
