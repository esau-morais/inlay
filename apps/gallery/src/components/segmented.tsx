import { useId } from "react";

type Option<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  legend: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className="flex min-w-0 items-start gap-2.5">
      <legend className="float-left pt-1.5 text-xs font-medium text-muted-foreground">
        {legend}
      </legend>
      <div className="flex min-w-0 flex-wrap rounded-lg bg-muted p-0.5">
        {options.map((option) => (
          <label key={option.value} className="shrink-0">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="block cursor-pointer rounded-md px-2.5 py-1 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-xs peer-focus-visible:outline-2 peer-focus-visible:outline-ring hover:text-foreground">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
