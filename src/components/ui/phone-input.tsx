"use client";

import { IMaskInput } from "react-imask";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { parsePhone } from "@/lib/phone";

type PhoneInputProps = {
  value?: string;
  onChange?: (raw: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
};

// Accepts raw value ("18091234567"), displays masked (+1 (809) 123-4567).
// onChange returns the raw digits only.
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, onBlur, disabled, className }, ref) => {
    return (
      <IMaskInput
        mask="+1 (000) 000-0000"
        value={value ?? ""}
        onAccept={(_formatted, maskRef) => {
          onChange?.(parsePhone(maskRef.value));
        }}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="+1 (809) 000-0000"
        inputMode="tel"
        inputRef={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
