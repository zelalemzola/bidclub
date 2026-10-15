import { cn } from "@bidclub/ui";

export function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "bg-primary text-primary-foreground"
      : status === "closed"
        ? "bg-destructive/10 text-destructive"
        : "border border-border bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        styles,
      )}
    >
      {status}
    </span>
  );
}
