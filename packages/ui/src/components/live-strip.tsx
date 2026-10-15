import { cn } from "../lib/utils";

export function LiveStrip({
  label = "LIVE",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-ink shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-danger opacity-70 live-pulse" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
      </span>
      {label}
    </div>
  );
}
