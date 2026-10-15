import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Auction, Bid, Payment, Profile } from "@bidclub/shared";
import {
  DEFAULT_AUCTION_DURATION_MS,
  DEFAULT_BID_FEE_BIRR,
  DEFAULT_MAX_BIDS,
} from "@bidclub/shared";
import { createClient } from "@/lib/supabase/client";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Profile", "Profiles", "Auctions", "Auction", "Bids", "Payments"],
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
          return { data: data as Profile };
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

    getProfiles: builder.query<Profile[], void>({
      async queryFn() {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: (data ?? []) as Profile[] };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load users",
            },
          };
        }
      },
      providesTags: ["Profiles"],
    }),

    getPayments: builder.query<Payment[], void>({
      async queryFn() {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("payments")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);
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
      providesTags: ["Payments"],
    }),

    getAuctions: builder.query<Auction[], void>({
      async queryFn() {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("auctions")
            .select("*, winner:profiles!auctions_winner_id_fkey(id, display_name)")
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
      async onCacheEntryAdded(
        _arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved },
      ) {
        let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
          null;
        try {
          await cacheDataLoaded;
          const supabase = createClient();
          channel = supabase
            .channel("admin-auctions")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "auctions" },
              () => {
                dispatch(api.util.invalidateTags(["Auctions"]));
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

    getAuction: builder.query<Auction, string>({
      async queryFn(id) {
        try {
          const supabase = createClient();
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
    }),

    getBids: builder.query<Bid[], string>({
      async queryFn(auctionId) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("bids")
            .select("*, profile:profiles(id, display_name)")
            .eq("auction_id", auctionId)
            .order("created_at", { ascending: false })
            .limit(100);
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: (data ?? []) as Bid[] };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Failed to load bids",
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
          channel = supabase
            .channel(`admin-bids-${auctionId}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "bids",
                filter: `auction_id=eq.${auctionId}`,
              },
              (payload) => {
                updateCachedData((draft) => {
                  draft.unshift(payload.new as Bid);
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

    createAuction: builder.mutation<
      Auction,
      {
        title: string;
        description: string;
        imageUrl?: string | null;
        imageUrls?: string[];
        maxBids?: number;
        bidFeeBirr?: number;
        status?: "draft" | "active";
        endsAt?: string | null;
      }
    >({
      async queryFn(input) {
        try {
          const supabase = createClient();
          const endsAt =
            input.endsAt ??
            (input.status === "active"
              ? new Date(Date.now() + DEFAULT_AUCTION_DURATION_MS).toISOString()
              : null);
          const gallery = input.imageUrls?.length
            ? input.imageUrls
            : input.imageUrl
              ? [input.imageUrl]
              : [];
          const { data, error } = await supabase
            .from("auctions")
            .insert({
              title: input.title,
              description: input.description,
              image_url: input.imageUrl ?? gallery[0] ?? null,
              image_urls: gallery,
              max_bids: input.maxBids ?? DEFAULT_MAX_BIDS,
              bid_fee_birr: input.bidFeeBirr ?? DEFAULT_BID_FEE_BIRR,
              status: input.status ?? "draft",
              ends_at: endsAt,
            })
            .select()
            .single();
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: data as Auction };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Create failed",
            },
          };
        }
      },
      invalidatesTags: ["Auctions"],
    }),

    updateAuction: builder.mutation<
      Auction,
      {
        id: string;
        title?: string;
        description?: string;
        imageUrl?: string | null;
        maxBids?: number;
        bidFeeBirr?: number;
        status?: "draft" | "active" | "closed";
        endsAt?: string | null;
      }
    >({
      async queryFn({ id, ...input }) {
        try {
          const supabase = createClient();
          const patch: Record<string, unknown> = {};
          if (input.title !== undefined) patch.title = input.title;
          if (input.description !== undefined) patch.description = input.description;
          if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;
          if (input.maxBids !== undefined) patch.max_bids = input.maxBids;
          if (input.bidFeeBirr !== undefined) patch.bid_fee_birr = input.bidFeeBirr;
          if (input.status !== undefined) patch.status = input.status;
          if (input.endsAt !== undefined) patch.ends_at = input.endsAt;

          const { data, error } = await supabase
            .from("auctions")
            .update(patch)
            .eq("id", id)
            .select()
            .single();
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: data as Auction };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Update failed",
            },
          };
        }
      },
      invalidatesTags: (_r, _e, arg) => [
        "Auctions",
        { type: "Auction", id: arg.id },
      ],
    }),

    closeAuction: builder.mutation<Auction, string>({
      async queryFn(id) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.rpc("close_auction", {
            p_auction_id: id,
          });
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          return { data: data as Auction };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Close failed",
            },
          };
        }
      },
      invalidatesTags: (_r, _e, id) => ["Auctions", { type: "Auction", id }],
    }),

    uploadImage: builder.mutation<string, File>({
      async queryFn(file) {
        try {
          const supabase = createClient();
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from("auction-images")
            .upload(path, file, { upsert: false });
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
          const { data } = supabase.storage.from("auction-images").getPublicUrl(path);
          return { data: data.publicUrl };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "Upload failed",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetProfilesQuery,
  useGetPaymentsQuery,
  useGetAuctionsQuery,
  useGetAuctionQuery,
  useGetBidsQuery,
  useCreateAuctionMutation,
  useUpdateAuctionMutation,
  useCloseAuctionMutation,
  useUploadImageMutation,
} = api;
