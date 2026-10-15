import type { ReactNode } from "react";
import { cn } from "@bidclub/ui";

export function MobileRowCard({
  title,
  trailing,
  fields,
  onClick,
  className,
}: {
  title: ReactNode;
  trailing?: ReactNode;
  fields?: { label: string; value: ReactNode }[];
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "mobile-card w-full text-left",
        onClick && "transition hover:border-primary/25",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 font-heading text-sm font-semibold tracking-tight">
          {title}
        </div>
        {trailing ? (
          <div className="shrink-0 text-xs text-muted-foreground">{trailing}</div>
        ) : null}
      </div>
      {fields?.length ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {f.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Comp>
  );
}
