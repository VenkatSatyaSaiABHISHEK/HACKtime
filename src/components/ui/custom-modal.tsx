"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowButton } from "./glow-button";
import { GlassPanel } from "./glass-panel";
import { AlertTriangle, X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
  children?: React.ReactNode;
}

export function CustomModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  children,
}: CustomModalProps) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-md z-10"
          >
            <GlassPanel className="p-6 relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex gap-4 items-start mt-2">
                {variant === "danger" && (
                  <div className="p-2.5 bg-danger/10 text-danger border border-danger/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold tracking-tight text-white mb-2">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {description}
                    </p>
                  )}
                  {children}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <GlowButton variant="outline" size="sm" onClick={onClose}>
                  {cancelText}
                </GlowButton>
                <GlowButton
                  variant={variant === "danger" ? "danger" : "primary"}
                  size="sm"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  {confirmText}
                </GlowButton>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
