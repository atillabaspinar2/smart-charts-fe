import React, { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";

const DEFAULT_DEBOUNCE_MS = 120;

export type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
  /** Delay before notifying parent (reduces chart re-renders while dragging). */
  debounceMs?: number;
  "aria-label"?: string;
  title?: string;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<"input">,
  | "type"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onBlur"
  | "aria-label"
  | "title"
  | "className"
>;

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  "aria-label": ariaLabel = "Pick color",
  title = "Pick color",
  className,
  ...rest
}) => {
  const [localColor, setLocalColor] = useState(color);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const colorPropRef = useRef(color);
  useEffect(() => {
    if (color === colorPropRef.current) return;
    colorPropRef.current = color;
    setLocalColor(color);
  }, [color]);

  const debouncedEmit = useMemo(
    () =>
      debounce((value: string) => {
        onChangeRef.current(value);
      }, debounceMs),
    [debounceMs],
  );

  useEffect(() => {
    return () => {
      debouncedEmit.cancel();
    };
  }, [debouncedEmit]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocalColor(next);
    debouncedEmit(next);
  };

  /**
   * Native `<input type="color">` often blurs when the system color UI opens; flushing
   * immediately would sync parent state and re-render, which closes the picker. Only flush
   * after focus has actually left this input (not when it returns on the next frame).
   */
  const handleBlur = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
          return;
        }
        debouncedEmit.flush();
      });
    });
  };

  return (
    <input
      ref={inputRef}
      type="color"
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "size-8 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5",
        className,
      )}
      value={localColor}
      onChange={handleChange}
      onBlur={handleBlur}
      {...rest}
    />
  );
};
