import { z } from "zod";
import { isValidBidCents } from "./bid-grid";
import { BID_MAX_BIRR, BID_MIN_BIRR, DEFAULT_BID_FEE_BIRR } from "./constants";

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Display name must be at least 2 characters")
  .max(40, "Display name is too long");

export const emailSchema = z.string().email("Enter a valid email");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

/** Ethiopian mobile: 09xxxxxxxx, 07xxxxxxxx, or +2519/+2517… */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .refine(
    (v) => /^(?:\+251|0)?[79]\d{8}$/.test(v),
    "Enter a valid Ethiopian phone number",
  );

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  phone: phoneSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const bidAmountCentsSchema = z
  .number()
  .int("Bid must be a whole cents value")
  .refine(isValidBidCents, {
    message: `Bid must be any amount from ${BID_MIN_BIRR.toFixed(2)} to ${BID_MAX_BIRR.toFixed(2)} ETB`,
  });

export const placeBidSchema = z.object({
  auctionId: z.string().uuid(),
  amountCents: bidAmountCentsSchema,
});

export const createAuctionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(4000),
  imageUrl: z.string().url().nullable().optional(),
  imageUrls: z.array(z.string().url()).max(12).optional(),
  /** Optional legacy field — arenas close on the 20-day timer, not bid count. */
  maxBids: z.number().int().min(1).max(1_000_000).optional(),
  bidFeeBirr: z
    .number()
    .positive("Bid fee must be greater than 0")
    .max(10_000)
    .default(DEFAULT_BID_FEE_BIRR),
  status: z.enum(["draft", "active"]).default("draft"),
});

export const updateAuctionSchema = createAuctionSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(["draft", "active", "closed"]).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;
