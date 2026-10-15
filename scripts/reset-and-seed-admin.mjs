/**
 * Wipe BidClub app data + auth users, then create a fresh admin.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/reset-and-seed-admin.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 */
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(__dirname, "../apps/web/package.json"));
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.BIDCLUB_ADMIN_EMAIL ?? "admin@bidclub.local";
const ADMIN_PASSWORD = process.env.BIDCLUB_ADMIN_PASSWORD ?? "BidClubAdmin!2026";
const ADMIN_NAME = process.env.BIDCLUB_ADMIN_NAME ?? "BidClub Admin";

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/reset-and-seed-admin.mjs",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const NIL = "00000000-0000-0000-0000-000000000000";

async function deleteAllAuthUsers() {
  let removed = 0;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (error) throw error;
    const users = data?.users ?? [];
    if (users.length === 0) break;
    for (const user of users) {
      const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
      if (delErr) throw delErr;
      removed += 1;
      console.log(`  deleted auth user ${user.email ?? user.id}`);
    }
  }
  return removed;
}

async function wipeTable(name) {
  if (name === "auctions") {
    const { error: clearWinners } = await admin
      .from("auctions")
      .update({ winner_id: null, winning_amount_cents: null })
      .neq("id", NIL);
    if (clearWinners) throw clearWinners;
  }

  const { error } = await admin.from(name).delete().neq("id", NIL);
  if (error) throw error;
  console.log(`  cleared ${name}`);
}

async function wipePublicTables() {
  for (const name of ["payments", "bids", "auctions", "profiles"]) {
    await wipeTable(name);
  }
}

async function listAllStoragePaths(bucket, prefix = "") {
  const { data, error } = await admin.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;
  const paths = [];
  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      paths.push(...(await listAllStoragePaths(bucket, path)));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

async function clearAuctionImages() {
  try {
    const paths = await listAllStoragePaths("auction-images");
    if (!paths.length) {
      console.log("  storage: empty");
      return;
    }
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      const { error } = await admin.storage.from("auction-images").remove(chunk);
      if (error) throw error;
    }
    console.log(`  removed ${paths.length} storage object(s)`);
  } catch (err) {
    console.log(`  storage skip: ${err.message ?? err}`);
  }
}

async function createAdmin() {
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: ADMIN_NAME, role: "admin" },
  });
  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error("createUser returned no user");

  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: user.id,
      display_name: ADMIN_NAME,
      role: "admin",
      registration_paid_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (upsertErr) throw upsertErr;

  return user;
}

async function main() {
  console.log("BidClub reset + admin seed\n");
  console.log("1) Clearing public tables…");
  await wipePublicTables();

  console.log("2) Clearing auction images…");
  await clearAuctionImages();

  console.log("3) Deleting auth users…");
  const n = await deleteAllAuthUsers();
  console.log(`  removed ${n} auth user(s)`);

  console.log("4) Creating admin…");
  const user = await createAdmin();

  console.log("\nDone. Sign in to the admin app (localhost:3001) with:\n");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  User id:  ${user.id}`);
  console.log("");
}

main().catch((err) => {
  console.error("\nFailed:", err.message ?? err);
  process.exit(1);
});
