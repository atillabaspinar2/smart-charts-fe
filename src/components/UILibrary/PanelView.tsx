import React from "react";
import {
  CardAction,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const PanelView: React.FC<{
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  headerRight?: React.ReactNode;
  onHeaderMouseDown?: (e: React.MouseEvent<HTMLElement>) => void;
  hideBody?: boolean;
  bodyClassName?: string;
  /** Extra classes applied to the CardHeader element. */
  headerClassName?: string;
  /** Extra classes applied to the title wrapper (CardTitle). */
  titleClassName?: string;
}> = ({
  title,
  children,
  className = "",
  style,
  onClick,
  headerRight,
  onHeaderMouseDown,
  hideBody = false,
  bodyClassName = "",
  headerClassName = "",
  titleClassName = "",
}) => {
  return (
    <Card
      style={style}
      onClick={onClick}
      className={`gap-0 overflow-hidden border border-border bg-card py-0 text-card-foreground shadow-[0_3px_8px_rgba(34,34,59,0.12)] ${className}`}
    >
      <CardHeader
        className={`min-h-10 flex! flex-row! items-center! justify-between! rounded-t-lg border-b border-border bg-muted px-3 py-2! text-muted-foreground ${
          onHeaderMouseDown ? "cursor-ns-resize select-none" : ""
        } ${headerClassName}`}
        onMouseDown={onHeaderMouseDown}
      >
        <CardTitle className={`self-center text-[11px] font-semibold leading-none tracking-wide uppercase text-muted-foreground ${titleClassName}`}>
          {title}
        </CardTitle>
        {headerRight ? (
          <CardAction className="self-center">{headerRight}</CardAction>
        ) : null}
      </CardHeader>
      {!hideBody && (
        <CardContent
          className={`flex-1 rounded-b-lg bg-card p-0 text-card-foreground ${bodyClassName}`}
        >
          {children}
        </CardContent>
      )}
    </Card>
  );
};
