import type { FC, InputHTMLAttributes } from "react";

interface CustomInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> {
  label?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const CustomInput: FC<CustomInputProps> = ({
  label,
  id,
  containerClassName = "mb-4",
  labelClassName = "block text-sm font-medium mb-1",
  inputClassName = "w-full p-2 border border-gray-300 bg-white rounded",
  ...inputProps
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className={inputClassName} {...inputProps} />
    </div>
  );
};
