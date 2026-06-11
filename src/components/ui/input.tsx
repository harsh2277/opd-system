import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const inputVariants = cva(
  "flex h-9 w-full min-w-0 px-3 py-2 text-sm bg-white transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--neutral-400)] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "border border-[var(--neutral-200)] focus-visible:border-[var(--brand-500)] focus-visible:ring-[var(--brand-100)] rounded-md",
        primary: "border border-[var(--neutral-200)] focus-visible:border-[var(--brand-500)] focus-visible:ring-[var(--brand-100)] rounded-md",
        secondary: "bg-[var(--neutral-100)] border border-transparent focus-visible:bg-white focus-visible:border-[var(--brand-500)] focus-visible:ring-[var(--brand-100)] rounded-md",
        line: "border-b border-[var(--neutral-200)] focus-visible:border-[var(--brand-500)] focus-visible:ring-0 rounded-none bg-transparent px-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface InputProps
  extends Omit<React.ComponentProps<"input">, "variant">,
    VariantProps<typeof inputVariants> {
  label?: string;
}

function Input({ className, variant, type, label, id, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? (label ? generatedId : undefined);
  const inputEl = (
    <input
      id={inputId}
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );

  if (label) {
    return (
      <div className="space-y-1.5 w-full text-left">
        <label htmlFor={inputId} className="text-xs font-semibold text-[var(--neutral-700)] block">
          {label}
        </label>
        {inputEl}
      </div>
    );
  }

  return inputEl;
}

export { Input, inputVariants };
