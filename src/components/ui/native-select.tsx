import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function NativeSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "native-select flex h-11 w-full appearance-none rounded-md border border-border bg-card px-3 pr-10 text-base text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { NativeSelect };
