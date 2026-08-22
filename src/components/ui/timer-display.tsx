"use client";

import React from "react";

interface TimerDisplayProps {
  seconds: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "giant";
  theme?: "light" | "dark";
}

export function TimerDisplay({ seconds, className = "", size = "lg", theme = "dark" }: TimerDisplayProps) {
  // Format seconds to HH:MM:SS
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const hStr = hrs.toString().padStart(2, "0");
  const mStr = mins.toString().padStart(2, "0");
  const sStr = secs.toString().padStart(2, "0");

  const sizeClasses = {
    sm: "text-2xl font-mono tracking-tight",
    md: "text-4xl font-mono tracking-tight",
    lg: "text-6xl md:text-7xl font-mono font-bold tracking-tighter",
    giant: "text-[4.5rem] sm:text-[7rem] md:text-[9rem] font-mono font-black tracking-tighter select-none leading-none",
  };

  const isLight = theme === "light";

  // Helper to render individual characters to avoid shifting layout
  const renderDigitGroup = (valStr: string) => {
    return (
      <div className="inline-flex">
        {valStr.split("").map((char, idx) => (
          <div
            key={idx}
            className={`w-[0.6em] text-center inline-block tabular-nums rounded-xl border mx-0.5 ${
              isLight
                ? "text-[#111827] bg-[#000000]/5 border-[#000000]/10"
                : "text-white text-glow-primary bg-white/5 border-white/5"
            }`}
          >
            {char}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex items-center justify-center font-mono ${isLight ? "text-[#111827]" : "text-white"} ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center gap-1">
        {renderDigitGroup(hStr)}
        <span className={`animate-pulse px-0.5 select-none ${isLight ? "text-primary/50" : "text-primary/70"}`}>:</span>
        {renderDigitGroup(mStr)}
        <span className={`animate-pulse px-0.5 select-none ${isLight ? "text-primary/50" : "text-primary/70"}`}>:</span>
        {renderDigitGroup(sStr)}
      </div>
    </div>
  );
}
