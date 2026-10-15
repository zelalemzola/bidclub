import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent gold-fill text-night",
        secondary: "border-transparent bg-cream-deep text-ink-soft",
        outline: "border-line text-ink-soft",
        live: "border-transparent bg-night text-gold-bright",
        closed: "border-transparent bg-danger/10 text-danger",
        draft: "border-line text-mute",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
