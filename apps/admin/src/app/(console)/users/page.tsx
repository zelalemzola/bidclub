"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Shield, UserX, Users } from "lucide-react";
import { Badge } from "@bidclub/ui";
import { KpiCard, KpiGrid } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { MobileRowCard } from "@/components/table/mobile-row-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { activatedUsers } from "@/lib/analytics";
import { useGetProfilesQuery } from "@/store/api";

export default function UsersPage() {
  const { data: profiles, isLoading } = useGetProfilesQuery();
  const [query, setQuery] = useState("");
  const [seatFilter, setSeatFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const activated = activatedUsers(profiles);
  const admins = profiles?.filter((p) => p.role === "admin").length ?? 0;
  const inactive = (profiles?.length ?? 0) - activated;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (profiles ?? []).filter((p) => {
      if (seatFilter === "activated" && !p.registration_paid_at) return false;
      if (seatFilter === "inactive" && p.registration_paid_at) return false;
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (!q) return true;
      return (
        p.display_name.toLowerCase().includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [profiles, query, seatFilter, roleFilter]);

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Users"
        description={`${profiles?.length ?? 0} accounts · ${activated} activated seats`}
        icon={Users}
      />

      <KpiGrid>
        <KpiCard
          title="Team size"
          value={isLoading ? "—" : String(profiles?.length ?? 0)}
          icon={Users}
          featured
        />
        <KpiCard
          title="Activated"
          value={isLoading ? "—" : String(activated)}
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard
          title="Inactive"
          value={isLoading ? "—" : String(inactive)}
          icon={UserX}
          tone="warn"
        />
        <KpiCard
          title="Admins"
          value={isLoading ? "—" : String(admins)}
          icon={Shield}
          tone="accent"
        />
      </KpiGrid>

      <div className="panel space-y-3 rounded-lg p-3 sm:p-4">
        <DataTableToolbar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search name or phone…"
          filters={[
            {
              id: "seat",
              label: "Seat",
              value: seatFilter,
              onChange: setSeatFilter,
              allLabel: "All seats",
              options: [
                { value: "activated", label: "Activated" },
                { value: "inactive", label: "Inactive" },
              ],
            },
            {
              id: "role",
              label: "Role",
              icon: Shield,
              value: roleFilter,
              onChange: setRoleFilter,
              allLabel: "All roles",
              options: [
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ],
            },
          ]}
        />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No users match this filter.
          </p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {filtered.map((p) => (
                <MobileRowCard
                  key={p.id}
                  title={p.display_name}
                  trailing={
                    <Badge variant="outline" className="capitalize">
                      {p.role}
                    </Badge>
                  }
                  fields={[
                    {
                      label: "Seat",
                      value: p.registration_paid_at ? "Activated" : "Inactive",
                    },
                    { label: "Phone", value: p.phone ?? "—" },
                  ]}
                />
              ))}
            </ul>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold">
                            {p.display_name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium">{p.display_name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {p.id.slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {p.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                            p.registration_paid_at
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.registration_paid_at ? "Activated" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.phone ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
