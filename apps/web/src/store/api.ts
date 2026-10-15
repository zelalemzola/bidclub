import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Auction,
  Bid,
  BidWithAuction,
  MockRegistrationResponse,
  Payment,
  PlaceBidResponse,
  Profile,
} from "@bidclub/shared";
import { createClient } from "@/lib/supabase/client";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Profile", "Auctions", "Auction", "Bids", "Winners", "MyActivity"],
  endpoints: (builder) => ({
    getProfile: builder.query<Profile | null, void>({
      async queryFn() {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return { data: null };
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };

          const profile = data as Profile;
          const metaName =
            typeof user.user_metadata?.display_name === "string"
              ? user.user_metadata.display_name.trim()
              : "";

          // Keep profiles.display_name in sync with signup metadata when it drifts
          if (metaName && metaName !== profile.display_name) {
            const { error: syncError } = await supabase
              .from("profiles")
              .update({ display_name: metaName })
              .eq("id", user.id);
            if (!syncError) profile.display_name = metaName;
          }

          return {
            data: {
              ...profile,
              email: user.email ?? null,
            },
          };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load profile",
            },
          };
        }
      },
      providesTags: ["Profile"],
    }),

    getAuctions: builder.query<Auction[], void>({
      async queryFn() {
        try {
          const supabase = createClient();
          try {
            await supabase.rpc("sync_expired_auctions");
          } catch {
            // Migration 004 may not be applied yet
          }
          const { data, error } = await supabase
            .from("auctions")
            .select("*, winner:profiles!auctions_winner_id_fkey(id, display_name)")
            .in("status", ["active", "closed"])
            .order("created_at", { ascending: false });
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: (data ?? []) as Auction[] };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load auctions",
            },
          };
        }
      },
      providesTags: ["Auctions"],
    }),

    getWinners: builder.query<Auction[], void>({
      async queryFn() {
        try {
          const supabase = createClient();
          try {
            await supabase.rpc("sync_expired_auctions");
          } catch {
            // Migration 004 may not be applied yet
          }
          const { data, error } = await supabase
            .from("auctions")
            .select("*, winner:profiles!auctions_winner_id_fkey(id, display_name)")
            .eq("status", "closed")
            .order("updated_at", { ascending: false })
            .limit(40);
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: (data ?? []) as Auction[] };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load winners",
            },
          };
        }
      },
      providesTags: ["Winners", "Auctions"],
    }),

    getAuction: builder.query<Auction, string>({
      async queryFn(id) {
        try {
          const supabase = createClient();
          try {
            await supabase.rpc("sync_expired_auctions");
          } catch {
            // Migration 004 may not be applied yet
          }
          const { data, error } = await supabase
            .from("auctions")
            .select("*, winner:profiles!auctions_winner_id_fkey(id, display_name)")
            .eq("id", id)
            .single();
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: data as Auction };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load auction",
            },
          };
        }
      },
      providesTags: (_r, _e, id) => [{ type: "Auction", id }],
      async onCacheEntryAdded(
        id,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
          null;
        try {
          await cacheDataLoaded;
          const supabase = createClient();
          channel = supabase
            .channel(`auction-${id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "auctions",
                filter: `id=eq.${id}`,
              },
              (payload) => {
                updateCachedData((draft) => {
                  Object.assign(draft, payload.new);
                });
              },
            )
            .subscribe();
        } catch {
          // cache entry may have been removed
        }
        await cacheEntryRemoved;
        if (channel) {
          const supabase = createClient();
          await supabase.removeChannel(channel);
        }
      },
    }),

    /** Own bids only — other players' bids stay sealed until auction close / winner reveal */
    getMyBids: builder.query<Bid[], string>({
      async queryFn(auctionId) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return { data: [] };
          const { data, error } = await supabase
            .from("bids")
            .select("*")
            .eq("auction_id", auctionId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: (data ?? []) as Bid[] };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load your bids",
            },
          };
        }
      },
      providesTags: (_r, _e, id) => [{ type: "Bids", id }],
      async onCacheEntryAdded(
        auctionId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
          null;
        try {
          await cacheDataLoaded;
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;
          channel = supabase
            .channel(`my-bids-${auctionId}-${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "bids",
                filter: `auction_id=eq.${auctionId}`,
              },
              (payload) => {
                const bid = payload.new as Bid;
                if (bid.user_id !== user.id) return;
                updateCachedData((draft) => {
                  draft.unshift(bid);
                  if (draft.length > 50) draft.pop();
                });
              },
            )
            .subscribe();
        } catch {
          // ignore
        }
        await cacheEntryRemoved;
        if (channel) {
          const supabase = createClient();
          await supabase.removeChannel(channel);
        }
      },
    }),

    getMyBidHistory: builder.query<BidWithAuction[], void>({
      async queryFn() {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return { data: [] };
          const { data, error } = await supabase
            .from("bids")
            .select(
              "*, auction:auctions(id, title, image_url, status, bid_fee_birr, ends_at)",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(40);
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: (data ?? []) as BidWithAuction[] };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load bid history",
            },
          };
        }
      },
      providesTags: ["MyActivity"],
    }),

    getMyPayments: builder.query<Payment[], void>({
      async queryFn() {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return { data: [] };
          const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(30);
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: (data ?? []) as Payment[] };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load payments",
            },
          };
        }
      },
      providesTags: ["MyActivity"],
    }),

    mockPayRegistration: builder.mutation<MockRegistrationResponse, void>({
      async queryFn() {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.rpc("mock_pay_registration");
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: data as MockRegistrationResponse };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Payment failed",
            },
          };
        }
      },
      invalidatesTags: ["Profile", "MyActivity"],
    }),

    placeBid: builder.mutation<
      PlaceBidResponse,
      { auctionId: string; amountCents: number }
    >({
      async queryFn({ auctionId, amountCents }) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.rpc("place_bid", {
            p_auction_id: auctionId,
            p_amount_cents: amountCents,
          });
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: data as PlaceBidResponse };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Bid failed",
            },
          };
        }
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "Auction", id: arg.auctionId },
        { type: "Bids", id: arg.auctionId },
        "Auctions",
        "Winners",
        "Profile",
        "MyActivity",
      ],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetAuctionsQuery,
  useGetWinnersQuery,
  useGetAuctionQuery,
  useGetMyBidsQuery,
  useGetMyBidHistoryQuery,
  useGetMyPaymentsQuery,
  useMockPayRegistrationMutation,
  usePlaceBidMutation,
} = api;
