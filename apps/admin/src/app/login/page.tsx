"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { signInSchema } from "@bidclub/shared";
import { Button, Input, Label, cn } from "@bidclub/ui";
import { createClient } from "@/lib/supabase/client";

function BrandMark({ size = "lg" }: { size?: "sm" | "lg" }) {
  const mark = size === "lg" ? "size-16 text-2xl" : "size-12 text-lg";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-accent font-heading font-bold tracking-tight text-accent-foreground shadow-sm",
        mark,
      )}
      aria-hidden
    >
      BC
    </div>
  );
}

function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        parsed.data,
      );
      if (authError) {
        setError(authError.message);
        return;
      }
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (profile?.role !== "admin") {
          await supabase.auth.signOut();
          setError("This account is not an admin.");
          return;
        }
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-5", className)}>
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Sign in
        </h2>
        <p className="text-sm text-muted-foreground">
          Access auctions, winners, users, and fee reports.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 rounded-md bg-background/80 pl-9"
              placeholder="admin@bidclub.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-11 rounded-md bg-background/80 pl-9"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-11 w-full gap-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:border-accent focus-visible:ring-accent/40"
      >
        {loading ? "Signing in…" : "Sign in"}
        {!loading ? <ArrowRight className="size-4" aria-hidden /> : null}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <Image
        src="/images/login-background.png"
        alt=""
        fill
        priority
        className="scale-105 object-cover blur-[2.5px]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[oklch(0.26_0.035_145)]/55" />
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.28_0.04_145)]/70 via-transparent to-[oklch(0.78_0.18_125)]/35" />

      <div className="relative z-10 grid h-full w-full lg:grid-cols-[1.15fr_minmax(22rem,26rem)]">
        <section className="relative hidden h-full flex-col justify-between p-10 text-white lg:flex xl:p-14">
          <div className="flex items-center gap-3">
            <BrandMark size="lg" />
            <div>
              <p className="font-heading text-2xl font-semibold tracking-tight">
                BidClub
              </p>
              <p className="text-sm text-white/65">Admin console</p>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-[0.7rem] font-medium tracking-[0.22em] text-accent uppercase">
              Arenas · fees · winners
            </p>
            <h1 className="font-heading mt-3 text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              Run sealed arenas from one desk.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              List products, watch live bids, settle winners, and keep fee
              reports tight — built for BidClub operators.
            </p>
          </div>

          <p className="text-xs text-white/45">Authorized access only</p>
        </section>

        <section className="flex h-full w-full items-center justify-center p-5 sm:p-8 lg:bg-card/95 lg:p-10 lg:shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.35)] lg:backdrop-blur-xl">
          <div className="w-full max-w-[22rem]">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <BrandMark size="sm" />
              <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
                BidClub
              </h1>
              <p className="mt-1 text-sm text-white/75">Admin console</p>
            </div>

            <div className="rounded-lg border border-white/15 bg-card/92 p-6 shadow-xl backdrop-blur-md sm:p-7 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
              <div className="mb-6 hidden lg:block">
                <div className="mb-5 h-1 w-10 rounded-full bg-accent" />
                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Operator access
                </p>
              </div>

              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
