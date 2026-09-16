import type { MarkColor } from "@/lib/types";
import { cn } from "@/lib/utils";

function StethoscopeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d="M13 7.5v15c0 6.35 5.15 11.5 11.5 11.5"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M13 7.5c0-2.3 1.8-4.1 4.1-4.1h.6c2.3 0 4.1 1.8 4.1 4.1"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="34.5" cy="22.5" r="4.4" stroke="currentColor" strokeWidth="3.2" />
      <path
        d="M24.5 34v3.2c0 4.4 3.5 8 7.9 8 3.1 0 5.8-1.8 7.1-4.5"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="40.2" cy="41.4" r="3.5" fill="currentColor" />
    </svg>
  );
}

const MARK: Record<MarkColor, string> = {
  teal: "bg-mark-teal text-mark-teal-foreground",
  navy: "bg-primary text-primary-foreground",
  forest: "bg-ok text-ok-foreground",
};

export function ClinicMark({
  line1,
  line2,
  color = "teal",
  className,
}: {
  line1: string;
  line2: string;
  color?: MarkColor;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl px-4 py-3 print-exact",
        MARK[color],
        className,
      )}
    >
      <StethoscopeIcon className="size-11" />
      <div className="flex min-w-0 flex-col leading-none">
        <span className="font-display text-[1.4rem] font-semibold tracking-tight">
          {line1}
        </span>
        {line2 ? (
          <span className="mt-1 font-display text-base font-medium italic tracking-wide opacity-95">
            {line2}
          </span>
        ) : null}
      </div>
    </div>
  );
}
