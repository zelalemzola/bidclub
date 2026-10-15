export type UserRole = "user" | "admin";

export type AuctionStatus = "draft" | "active" | "closed";

export type PaymentType = "registration" | "bid";

export type PaymentStatus = "mock_completed" | "pending" | "failed";

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  phone?: string | null;
  /** Auth email — attached client-side from the session, not a DB column. */
  email?: string | null;
  registration_paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  /** Cover image (usually the first gallery URL). */
  image_url: string | null;
  /** Full product gallery, ordered. */
  image_urls?: string[] | null;
  status: AuctionStatus;
  max_bids: number;
  bid_count: number;
  /** Per-product bid fee in ETB (admin-set). */
  bid_fee_birr?: number | null;
  ends_at: string | null;
  winner_id: string | null;
  winning_amount_cents: number | null;
  created_at: string;
  updated_at: string;
  winner?: Pick<Profile, "id" | "display_name"> | null;
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount_cents: number;
  created_at: string;
  profile?: Pick<Profile, "id" | "display_name"> | null;
}

export interface BidWithAuction extends Bid {
  auction?: Pick<
    Auction,
    "id" | "title" | "image_url" | "image_urls" | "status" | "bid_fee_birr" | "ends_at"
  > | null;
}

export interface Payment {
  id: string;
  user_id: string;
  type: PaymentType;
  amount_birr: number;
  status: PaymentStatus;
  auction_id: string | null;
  bid_id: string | null;
  created_at: string;
}

export interface PlaceBidRequest {
  auctionId: string;
  amountCents: number;
}

export interface PlaceBidResponse {
  bid: Bid;
  auction: Auction;
  payment: Payment;
}

export interface MockRegistrationResponse {
  profile: Profile;
  payment: Payment;
}
