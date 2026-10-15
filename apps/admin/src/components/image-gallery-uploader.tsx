"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { cn } from "@bidclub/ui";

export type GalleryPreview = {
  id: string;
  file: File;
  url: string;
};

type ImageGalleryUploaderProps = {
  value: GalleryPreview[];
  onChange: (next: GalleryPreview[]) => void;
  maxImages?: number;
  className?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V7m0 0l-3.5 3.5M12 7l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16.5V18a2 2 0 002 2h10a2 2 0 002-2v-1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function filesFromList(list: FileList | File[] | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list).filter((f) => f.type.startsWith("image/"));
}

function filesFromDataTransfer(dt: DataTransfer | null): File[] {
  if (!dt) return [];
  const fromFiles = filesFromList(dt.files);
  if (fromFiles.length) return fromFiles;

  const fromItems: File[] = [];
  for (const item of Array.from(dt.items ?? [])) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) fromItems.push(file);
    }
  }
  return fromItems;
}

/**
 * Modern product gallery picker — click, drag-drop, or paste images.
 */
export function ImageGalleryUploader({
  value,
  onChange,
  maxImages = 12,
  className,
}: ImageGalleryUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);
  const dragDepth = useRef(0);

  const room = Math.max(0, maxImages - value.length);
  const canAdd = room > 0;

  const appendFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length || room <= 0) return;
      const slice = incoming.slice(0, room);
      const next: GalleryPreview[] = slice.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      }));
      onChange([...value, ...next]);
    },
    [onChange, room, value],
  );

  function removeAt(id: string) {
    const target = value.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    onChange(value.filter((p) => p.id !== id));
  }

  function onDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragging(false);
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDragging(false);
    appendFiles(filesFromDataTransfer(e.dataTransfer));
  }

  // Single window paste listener — avoids double-add when the zone is focused
  // (zone onPaste + bubble to window used to both append the same image).
  useEffect(() => {
    function handleWindowPaste(e: globalThis.ClipboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const files = filesFromDataTransfer(e.clipboardData);
      if (!files.length || room <= 0) return;
      e.preventDefault();
      appendFiles(files);
      setPasteHint(true);
      window.setTimeout(() => setPasteHint(false), 1600);
    }
    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, [appendFiles, room]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Product gallery</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Drag & drop, paste (Ctrl/Cmd+V), or browse. First photo is the cover.
          </p>
        </div>
        <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
          {value.length}/{maxImages}
        </span>
      </div>

      <div
        tabIndex={0}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 border-dashed transition-all outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          dragging
            ? "scale-[1.01] border-accent bg-accent/10 shadow-[0_16px_48px_rgba(155,196,30,0.18)]"
            : "border-border bg-muted/40",
        )}
      >
        {value.length === 0 ? (
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:py-14"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-lg transition",
                dragging
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <IconUpload className="size-7" />
            </span>
            <div className="space-y-1">
              <p className="font-heading text-base font-semibold text-foreground">
                {dragging ? "Drop images to upload" : "Drop product photos here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <span className="font-semibold text-primary underline-offset-2 hover:underline">
                  browse files
                </span>
                {" · "}
                paste from clipboard
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              PNG, JPG, WebP, GIF · up to {maxImages} images
            </p>
          </label>
        ) : (
          <div className="p-3 sm:p-4">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {value.map((item, index) => (
                <li
                  key={item.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border/80 bg-muted shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.file.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-primary/10 opacity-90" />

                  {index === 0 ? (
                    <span className="absolute top-2 left-2 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground uppercase shadow-sm">
                      Cover
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeAt(item.id)}
                    className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-card/95 text-foreground shadow-md transition hover:bg-destructive hover:text-white"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <IconX className="size-3.5" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 px-2.5 pt-6 pb-2">
                    <p className="truncate text-[11px] font-semibold text-white">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-white/75">{formatBytes(item.file.size)}</p>
                  </div>
                </li>
              ))}

              {canAdd ? (
                <li>
                  <label
                    htmlFor={inputId}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/70 text-muted-foreground transition hover:border-accent hover:bg-accent/10 hover:text-foreground"
                  >
                    <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <IconPlus className="size-5" />
                    </span>
                    <span className="text-xs font-semibold">Add more</span>
                  </label>
                </li>
              ) : null}
            </ul>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-3">
              <p className="text-[11px] text-muted-foreground">
                {canAdd
                  ? `Drop, paste, or browse · ${room} slot${room === 1 ? "" : "s"} left`
                  : "Gallery full"}
              </p>
              {canAdd ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground transition hover:border-accent"
                >
                  Browse files
                </button>
              ) : null}
            </div>
          </div>
        )}

        {dragging && value.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-accent/70 backdrop-blur-[2px]">
            <p className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-lg">
              Drop to add photos
            </p>
          </div>
        ) : null}

        {pasteHint ? (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-lg">
            Image pasted into gallery
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          appendFiles(filesFromList(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
