"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface GlowButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function GlowButton({
  children,
  className,
  variant = "primary",
  size = "md",
  glow = true,
  ...props
}: GlowButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3 text-base gap-2.5",
  };

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 border border-primary/20",
    secondary: "bg-[#0891b2] text-white hover:bg-[#0891b2]/90 focus:ring-[#0891b2]/50 border border-[#0891b2]/20",
    success: "bg-success text-white hover:bg-success/90 focus:ring-success/50 border border-success/20",
    danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger/50 border border-danger/20",
    outline: "bg-transparent text-foreground hover:bg-white/5 border border-border hover:border-border-hover focus:ring-white/20",
    ghost: "bg-transparent text-muted hover:text-foreground hover:bg-white/5 focus:ring-white/10",
  };

  const glowStyles = {
    primary: "shadow-[0_0_15px_rgba(124,58,237,0.35)]",
    secondary: "shadow-[0_0_15px_rgba(8,145,178,0.35)]",
    success: "shadow-[0_0_15px_rgba(16,185,129,0.35)]",
    danger: "shadow-[0_0_15px_rgba(239,68,68,0.35)]",
    outline: "",
    ghost: "",
  };

  const cn = twMerge(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    glow && variant !== "outline" && variant !== "ghost" && glowStyles[variant],
    className
  );

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn}
      {...props}
    >
      {children}
    </motion.button>
  );
}
