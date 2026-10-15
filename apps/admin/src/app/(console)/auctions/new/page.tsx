"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle } from "lucide-react";
import {
  DEFAULT_AUCTION_DURATION_DAYS,
  DEFAULT_BID_FEE_BIRR,
  createAuctionSchema,
} from "@bidclub/shared";
import { Button, Input, Label, Textarea } from "@bidclub/ui";
import {
  ImageGalleryUploader,
  type GalleryPreview,
} from "@/components/image-gallery-uploader";
import { PageHeader } from "@/components/page-header";
import { getErrorMessage } from "@/lib/errors";
import {
  useCreateAuctionMutation,
  useUploadImageMutation,
} from "@/store/api";

const MAX_IMAGES = 12;

export default function NewAuctionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bidFeeBirr, setBidFeeBirr] = useState(DEFAULT_BID_FEE_BIRR);
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [previews, setPreviews] = useState<GalleryPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createAuction, { isLoading: creating }] = useCreateAuctionMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // Revoke object URLs only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const imageUrls: string[] = [];
    for (const item of previews.slice(0, MAX_IMAGES)) {
      const uploaded = await uploadImage(item.file);
      if ("error" in uploaded && uploaded.error) {
        setError(getErrorMessage(uploaded.error, "Upload failed"));
        return;
      }
      if (uploaded.data) imageUrls.push(uploaded.data);
    }

    const imageUrl = imageUrls[0] ?? null;

    const parsed = createAuctionSchema.safeParse({
      title,
      description,
      imageUrl,
      imageUrls,
      bidFeeBirr,
      status,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    const result = await createAuction({
      title: parsed.data.title,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl ?? null,
      imageUrls: parsed.data.imageUrls ?? imageUrls,
      bidFeeBirr: parsed.data.bidFeeBirr,
      status: parsed.data.status,
    });

    if ("error" in result && result.error) {
      setError(getErrorMessage(result.error, "Create failed"));
      return;
    }

    if (result.data) {
      router.push(`/auctions/${result.data.id}`);
    }
  }

  const busy = creating || uploading;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Create auction"
        description={`Upload a gallery and set the bid fee. Active listings run for ${DEFAULT_AUCTION_DURATION_DAYS} days.`}
        icon={PlusCircle}
        actions={
          <Button asChild size="sm" variant="outline" className="rounded-md">
            <Link href="/auctions">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <form onSubmit={onSubmit} className="panel space-y-6 p-4 sm:p-6">
        <div>
          <h2 className="font-heading text-base font-semibold tracking-tight">
            Listing details
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Title, story, fee, and product images for this arena.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Name</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md bg-background"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-28 rounded-md bg-background"
            required
          />
        </div>

        <ImageGalleryUploader
          value={previews}
          onChange={setPreviews}
          maxImages={MAX_IMAGES}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bidFee">Bid fee (ETB)</Label>
            <Input
              id="bidFee"
              type="number"
              min={1}
              step={1}
              value={bidFeeBirr}
              onChange={(e) => setBidFeeBirr(Number(e.target.value))}
              className="rounded-md bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              {DEFAULT_AUCTION_DURATION_DAYS} days
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "active")}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" disabled={busy} className="h-11 w-full rounded-md" size="lg">
          {busy ? "Saving…" : "Create auction"}
        </Button>
      </form>
    </div>
  );
}
