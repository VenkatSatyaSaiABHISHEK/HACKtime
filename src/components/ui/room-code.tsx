"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoomCodeProps {
  code: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function RoomCode({ code, className = "", size = "md" }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room code", err);
    }
  };

  const textSizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-lg px-4 py-2",
  };

  return (
    <div
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 bg-[#0c0c0e] hover:bg-[#121214] border border-white/10 hover:border-white/20 rounded-xl cursor-pointer select-none transition-all ${textSizes[size]} ${className}`}
      title="Click to copy room code"
    >
      <span className="font-mono font-bold tracking-widest text-[#0891b2] text-glow-secondary">
        {code.toUpperCase()}
      </span>
      <div className="relative w-3.5 h-3.5 flex items-center justify-center text-muted hover:text-foreground">
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-3.5 h-3.5 text-success" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Copy className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {copied && (
        <span className="text-[10px] font-mono text-success ml-1 animate-pulse">
          COPIED!
        </span>
      )}
    </div>
  );
}
