"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glowColor?: "primary" | "secondary" | "none";
}

export function GlassPanel({
  children,
  className,
  hoverEffect = false,
  glowColor = "none",
  ...props
}: GlassPanelProps) {
  const cn = twMerge(
    "glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
    hoverEffect && "glass-panel-hover hover:-translate-y-1",
    glowColor === "primary" && "hover:border-[rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]",
    glowColor === "secondary" && "hover:border-[rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.15)]",
    className
  );

  if (hoverEffect) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div className={cn} {...props}>
      {children}
    </motion.div>
  );
}
