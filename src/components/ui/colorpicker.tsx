export const ColorPicker: React.FC<{
  color: string;
  onChange: (color: string) => void;
}> = ({ color, onChange }) => {
  return (
    <input
      type="color"
      aria-label="Background color"
      title="Pick background color"
      className="size-8 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
      value={color}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
