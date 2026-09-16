import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
        issued: "border-transparent bg-ok/15 text-ok",
        draft: "border-transparent bg-muted text-muted-foreground",
        void: "border-transparent bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
