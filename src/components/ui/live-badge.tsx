"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface LiveBadgeProps {
  status?: "live" | "completed" | "upcoming" | "active";
  label?: string;
  size?: "sm" | "md";
  showDotOnly?: boolean;
}

export function LiveBadge({
  status = "live",
  label,
  size = "md",
  showDotOnly = false,
}: LiveBadgeProps) {
  const isLive = status === "live" || status === "active";
  const isCompleted = status === "completed";
  const isUpcoming = status === "upcoming";

  const dotColor = clsx(
    isLive && "bg-[#ef4444]", // Vibrant red for LIVE
    isCompleted && "bg-success", // Emerald for completed
    isUpcoming && "bg-[#0891b2]" // Cyan for upcoming
  );

  const ringColor = clsx(
    isLive && "border-[#ef4444]",
    isCompleted && "border-success",
    isUpcoming && "border-[#0891b2]"
  );

  const badgeBg = clsx(
    isLive && "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
    isCompleted && "bg-success/10 text-success border-success/20",
    isUpcoming && "bg-[#0891b2]/10 text-[#0891b2] border-[#0891b2]/20"
  );

  const textLabel = label || (isLive ? "LIVE" : isCompleted ? "COMPLETED" : "UPCOMING");

  if (showDotOnly) {
    return (
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className={twMerge("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)}></span>
        )}
        <span className={twMerge("relative inline-flex rounded-full h-2 w-2", dotColor)}></span>
      </span>
    );
  }

  return (
    <div
      className={twMerge(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase font-mono select-none",
        badgeBg
      )}
    >
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className={twMerge("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)}></span>
        )}
        <span className={twMerge("relative inline-flex rounded-full h-2 w-2", dotColor)}></span>
      </span>
      <span>{textLabel}</span>
    </div>
  );
}
