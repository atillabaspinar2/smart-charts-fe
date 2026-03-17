import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type SelectHTMLAttributes,
} from "react";

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "className"
> {
  label?: string;
  options: CustomSelectOption[];
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
}

export const CustomSelect: FC<CustomSelectProps> = ({
  label,
  id,
  options,
  value,
  defaultValue,
  disabled,
  onChange,
  name,
  required,
  containerClassName = "mb-4",
  labelClassName = "block text-sm font-medium mb-1",
  selectClassName = "inline-flex h-10 w-full items-center rounded-lg bg-white/90 px-3.5 text-left text-sm font-medium text-theme-text ring-1 ring-inset ring-theme-primary shadow-sm transition hover:bg-theme-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent disabled:cursor-not-allowed disabled:opacity-50",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    String(defaultValue ?? ""),
  );

  const selectedValue = value !== undefined ? String(value) : internalValue;
  const selectedItem = useMemo(
    () => options.find((item) => item.value === selectedValue),
    [options, selectedValue],
  );

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const commitChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.({ target: { value: nextValue } } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div className={containerClassName} ref={rootRef}>
      {label && (
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
      )}

      <input
        type="hidden"
        id={id}
        name={name}
        value={selectedValue}
        required={required}
      />

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={id ? `${id}-listbox` : undefined}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={selectClassName}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {selectedItem?.label ?? "Select"}
          </span>
          <span
            aria-hidden="true"
            className={`ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center text-theme-secondary transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {open && !disabled && (
          <div
            id={id ? `${id}-listbox` : undefined}
            role="listbox"
            className="absolute z-20 mt-2 w-full rounded-xl bg-white/95 p-1 ring-1 ring-theme-primary shadow-lg backdrop-blur"
          >
            {options.map((opt) => {
              const selected = opt.value === selectedValue;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => commitChange(opt.value)}
                  className={`flex w-full items-center justify-between rounded-md px-3.5 py-2 text-left text-sm transition ${
                    selected
                      ? "bg-theme-surface text-theme-strong"
                      : "text-theme-text hover:bg-theme-bg"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  <span
                    aria-hidden="true"
                    className="ml-3 inline-flex h-4 w-4 shrink-0 items-center justify-center"
                  >
                    {selected ? (
                      <svg
                        viewBox="0 0 14 14"
                        className="block h-3.5 w-3.5 text-theme-accent"
                      >
                        <path
                          d="M11.2 3.7 5.8 9.1 2.8 6.2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
