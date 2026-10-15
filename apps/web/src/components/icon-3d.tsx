"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@bidclub/ui";

/**
 * Local CC0 renders from https://3dicons.co (dynamic / color).
 * Files live in /public/icons/3d — static webp; motion added via Framer Motion.
 */
export const ICONS_3D = {
  money: "/icons/3d/money-clear.webp",
  dollar: "/icons/3d/dollar.webp",
  trophy: "/icons/3d/trophy-clear.webp",
  clock: "/icons/3d/clock-clear.webp",
  shield: "/icons/3d/shield.webp",
  rocket: "/icons/3d/rocket-clear.webp",
  bulb: "/icons/3d/bulb.webp",
  giftBox: "/icons/3d/gift-box.webp",
  headphone: "/icons/3d/headphone.webp",
  cube: "/icons/3d/cube.webp",
  megaphone: "/icons/3d/megaphone.webp",
  explorer: "/icons/3d/explorer.webp",
  notebook: "/icons/3d/notebook.webp",
  wallet: "/icons/3d/wallet.webp",
  setting: "/icons/3d/setting.webp",
} as const;

/** Icons already exported with transparent mats — skip multiply blend */
const CLEAR_ICONS = new Set<keyof typeof ICONS_3D>([
  "money",
  "rocket",
  "clock",
  "trophy",
]);

export type Icon3dName = keyof typeof ICONS_3D;

export type Icon3dMotion = "none" | "float" | "bob" | "pulse" | "spin";

type Icon3dProps = {
  name: Icon3dName;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
  /** Idle loop — use on featured fact icons (75 / 100 / 20 days) */
  motion?: Icon3dMotion;
  /** Stagger delay when used inside a reveal group */
  delay?: number;
  /** Knock out white mat / box — no bg, border, or shadow */
  clear?: boolean;
};

const LOOPS: Record<
  Exclude<Icon3dMotion, "none">,
  {
    animate: Record<string, number | number[]>;
    transition: Record<string, unknown>;
  }
> = {
  float: {
    animate: { y: [0, -10, 0], rotate: [0, 2, -2, 0] },
    transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
  },
  bob: {
    animate: { y: [0, -6, 0], scale: [1, 1.04, 1] },
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
  pulse: {
    animate: { scale: [1, 1.08, 1] },
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  spin: {
    animate: { rotate: [0, 8, -8, 0] },
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
};

export function Icon3d({
  name,
  alt = "",
  size = 64,
  className,
  priority = false,
  motion: motionKind = "none",
  delay = 0,
  clear = false,
}: Icon3dProps) {
  const reduce = useReducedMotion();
  const img = (
    <Image
      src={ICONS_3D[name]}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "pointer-events-none select-none border-0 bg-transparent object-contain shadow-none outline-none ring-0",
        // Multiply knocks out remaining white mats on non-cleared assets
        !CLEAR_ICONS.has(name) && !clear && "mix-blend-multiply",
        className,
      )}
      style={{ background: "transparent", boxShadow: "none" }}
    />
  );

  const wrapClass = cn(
    "inline-flex border-0 bg-transparent shadow-none outline-none ring-0",
    motionKind !== "none" && !reduce && "will-change-transform",
  );

  if (reduce || motionKind === "none") {
    return (
      <motion.span
        className={wrapClass}
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {img}
      </motion.span>
    );
  }

  const loop = LOOPS[motionKind];

  return (
    <motion.span
      className={wrapClass}
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="inline-flex border-0 bg-transparent shadow-none"
        animate={loop.animate}
        transition={{ ...loop.transition, delay: delay + 0.4 }}
      >
        {img}
      </motion.span>
    </motion.span>
  );
}
