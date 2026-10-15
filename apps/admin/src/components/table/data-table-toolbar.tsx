"use client";

import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Input, cn } from "@bidclub/ui";

export type TableFilterOption = { value: string; label: string };

export type TableFilterDef = {
  id: string;
  label: string;
  icon?: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: TableFilterOption[];
  allLabel?: string;
};

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  className,
  trailing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: TableFilterDef[];
  className?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-8 rounded-md bg-background/70 pl-8 text-sm shadow-sm"
        />
      </div>
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => {
          const Icon = f.icon;
          const options = [
            { value: "all", label: f.allLabel ?? `All ${f.label.toLowerCase()}` },
            ...f.options,
          ];
          return (
            <label key={f.id} className="relative shrink-0">
              <span className="sr-only">{f.label}</span>
              <span className="pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2 text-muted-foreground">
                {Icon ? <Icon className="size-3.5" /> : null}
              </span>
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className={cn(
                  "h-8 appearance-none rounded-md border border-border/80 bg-background/70 py-0 pr-7 text-xs shadow-sm",
                  Icon ? "pl-7" : "pl-2.5",
                )}
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
        {trailing}
      </div>
    </div>
  );
}
