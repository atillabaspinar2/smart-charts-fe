import type { FC, SelectHTMLAttributes } from "react";

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
  containerClassName = "mb-4",
  labelClassName = "block text-sm font-medium mb-1",
  selectClassName = "w-full p-2 border border-theme-primary bg-theme-bg text-theme-text rounded focus:outline-none focus:ring-1 focus:ring-theme-secondary",
  ...selectProps
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className={selectClassName} {...selectProps}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
