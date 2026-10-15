"use client";

import type { ReactNode } from "react";
import { useGetProfileQuery } from "@/store/api";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useGetProfileQuery();

  if (isLoading) {
    return (
      <div className="grid gap-2.5 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (profile && profile.role !== "admin") {
    return (
      <div className="panel max-w-lg p-5">
        <h2 className="font-heading text-base font-semibold tracking-tight">
          Admin access required
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account is signed in but not marked as admin. In Supabase SQL:
        </p>
        <pre className="font-mono mt-4 overflow-x-auto rounded-md bg-muted p-4 text-xs text-foreground">
          {`update profiles set role = 'admin' where id = '<your-user-id>';`}
        </pre>
      </div>
    );
  }

  return <>{children}</>;
}
