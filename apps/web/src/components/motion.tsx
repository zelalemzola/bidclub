"use client";

import { type ReactNode } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { cn } from "@bidclub/ui";

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

type RevealProps = {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "header" | "article";
  id?: string;
};

export function Reveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  once = true,
  amount = 0.2,
  as = "div",
  id,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }

  const props = {
    id,
    className,
    variants,
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once, amount, margin: "0px 0px -40px 0px" as const },
    transition: { delay },
    children,
  };

  if (as === "section") return <motion.section {...props} />;
  if (as === "header") return <motion.header {...props} />;
  if (as === "article") return <motion.article {...props} />;
  return <motion.div {...props} />;
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
  fast?: boolean;
  once?: boolean;
  amount?: number;
};

export function Stagger({
  children,
  className,
  as = "div",
  fast = false,
  once = true,
  amount = 0.15,
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const props = {
    className,
    variants: fast ? staggerFast : staggerContainer,
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once, amount, margin: "0px 0px -32px 0px" as const },
    children,
  };

  if (as === "section") return <motion.section {...props} />;
  if (as === "ul") return <motion.ul {...props} />;
  if (as === "ol") return <motion.ol {...props} />;
  return <motion.div {...props} />;
}

export function StaggerItem({
  children,
  className,
  variants = fadeUp,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const props = { className, variants, children };

  if (as === "li") return <motion.li {...props} />;
  if (as === "article") return <motion.article {...props} />;
  return <motion.div {...props} />;
}

/** Page-level entrance for headers / hero blocks */
export function PageEnter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}
