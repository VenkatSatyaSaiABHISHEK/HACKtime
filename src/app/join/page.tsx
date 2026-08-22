"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvent } from "@/context/event-context";
import { motion, AnimatePresence } from "framer-motion";
import { GlowButton } from "@/components/ui/glow-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ArrowRight, AlertTriangle, RefreshCw, Key, User } from "lucide-react";

export default function JoinEventPage() {
  const router = useRouter();
  const { joinEvent } = useEvent();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorUI, setShowErrorUI] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Please fill out both name and room code fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await joinEvent(code, name);
      if (success) {
        // Redirect to participant event dashboard
        router.push(`/event/${code.toUpperCase()}`);
      } else {
        setShowErrorUI(true);
      }
    } catch (e) {
      setError("Failed to join. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToJoin = () => {
    setShowErrorUI(false);
    setCode("");
    setName("");
    setError("");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505] select-none">
      {/* Animated visual elements */}
      <div className="absolute inset-0 grid-bg opacity-[0.06] z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] radial-glow opacity-20 filter blur-[100px] z-0 pointer-events-none" />

      {/* Main card wrapper */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-2 select-none group">
            <div className="relative flex items-center justify-center w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary text-glow-primary">
                <path d="M4 12h3l2-6 3 12 2-9 2 5h4" />
              </svg>
            </div>
            <span className="text-white font-bold tracking-tight text-base font-mono">
              HackPulse
            </span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {showErrorUI ? (
            /* ERROR STATE UI */
            <motion.div
              key="error-state"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <GlassPanel className="p-8 border-danger/20 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#0c0c0e]/90 to-transparent">
                <div className="w-12 h-12 bg-danger/10 text-danger border border-danger/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-mono tracking-wider text-white uppercase">Room Not Found</h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  We couldn't locate any active event under room code <span className="text-danger font-bold font-mono">{code.toUpperCase()}</span>. Check your code and try again.
                </p>
                <div className="mt-6">
                  <GlowButton variant="outline" size="sm" onClick={handleBackToJoin} className="w-full font-mono text-xs">
                    Back to Join
                  </GlowButton>
                </div>
              </GlassPanel>
            </motion.div>
          ) : (
            /* JOIN FORM CARD */
            <motion.div
              key="join-form"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <GlassPanel className="p-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                    Join the room
                  </h2>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Ask your organizer for the 6-character room access code.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-2.5 bg-danger/10 border border-danger/20 rounded-xl text-[10px] text-danger font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Room Code */}
                  <div>
                    <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block mb-1.5">
                      ROOM CODE
                    </label>
                    <div className="flex items-center border border-white/10 focus-within:border-secondary focus-within:shadow-[0_0_15px_rgba(8,145,178,0.15)] bg-[#050505]/40 rounded-xl px-3.5 py-2.5 transition-all">
                      <Key className="w-4 h-4 text-muted mr-2.5" />
                      <input
                        type="text"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. AI7X92"
                        className="bg-transparent text-sm font-bold tracking-widest font-mono text-white focus:outline-none w-full placeholder:text-muted uppercase"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Nickname */}
                  <div>
                    <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block mb-1.5">
                      YOUR NAME
                    </label>
                    <div className="flex items-center border border-white/10 focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(124,58,237,0.15)] bg-[#050505]/40 rounded-xl px-3.5 py-2.5 transition-all">
                      <User className="w-4 h-4 text-muted mr-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Smith"
                        className="bg-transparent text-sm font-sans font-medium text-white focus:outline-none w-full placeholder:text-muted"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <GlowButton type="submit" variant="secondary" size="md" className="w-full font-bold" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> JOINING EVENT
                      </>
                    ) : (
                      <>
                        JOIN EVENT <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </GlowButton>
                </form>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
