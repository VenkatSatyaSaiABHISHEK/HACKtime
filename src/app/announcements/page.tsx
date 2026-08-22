"use client";

import React, { useState } from "react";
import { useEvent, Announcement } from "@/context/event-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowButton } from "@/components/ui/glow-button";
import { Megaphone, Send, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementsPage() {
  const { announcements, addAnnouncement } = useEvent();
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "critical">("normal");

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addAnnouncement(content, priority);
    setContent("");
    setPriority("normal");
  };

  const getPriorityStyles = (prio: string) => {
    switch (prio) {
      case "critical":
        return "bg-danger/10 border-danger/30 text-danger text-glow-danger";
      case "important":
        return "bg-warning/10 border-warning/30 text-warning text-glow-warning";
      default:
        return "bg-primary/10 border-primary/20 text-primary text-glow-primary";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0891b2] text-glow-secondary uppercase">
              COMMUNICATIONS DEPLOYMENT
            </span>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight uppercase mt-0.5">
              BROADCAST HUB
            </h2>
          </div>
          <div>
            <span className="text-xs font-mono bg-white/5 border border-white/5 rounded-lg px-3 py-1 text-muted">
              {announcements.length} TOTAL MESSAGES
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Composer */}
          <div className="xl:col-span-1">
            <GlassPanel className="border-white/10 p-6 space-y-6 sticky top-24 bg-gradient-to-b from-[#0c0c0e]/90 to-transparent">
              <div>
                <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase mb-1">
                  NEW BROADCAST
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Compose updates that will show up immediately on all screen devices.
                </p>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter announcement text..."
                    className="w-full text-xs text-white bg-[#050505] border border-white/5 rounded-xl p-3 min-h-[140px] focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono tracking-widest text-muted uppercase">PRIORITY INDICATOR</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["normal", "important", "critical"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          priority === p
                            ? p === "critical"
                              ? "bg-danger/20 border-danger text-danger text-glow-danger"
                              : p === "important"
                              ? "bg-warning/20 border-warning text-warning text-glow-warning"
                              : "bg-primary/20 border-primary text-primary text-glow-primary"
                            : "bg-transparent border-white/5 text-muted hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <GlowButton type="submit" variant="primary" className="w-full">
                  Deploy Broadcast <Send className="w-4 h-4 ml-1.5" />
                </GlowButton>
              </form>

              {/* Safety notice */}
              <div className="flex gap-2.5 items-start p-3 bg-white/5 border border-white/5 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted leading-relaxed font-mono">
                  CRITICAL broadcasts display as popups and lock screens until dismissed.
                </p>
              </div>
            </GlassPanel>
          </div>

          {/* Right Column: Historical logs */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-muted uppercase">
              TRANSMITTED MESSAGES HISTORY
            </h3>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {announcements.length === 0 ? (
                  <GlassPanel className="p-8 text-center border-white/5">
                    <span className="text-xs font-mono text-muted">No messages broadcasted yet.</span>
                  </GlassPanel>
                ) : (
                  announcements.map((ann, idx) => (
                    <motion.div
                      key={ann.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                    >
                      <GlassPanel className="p-5 border-white/5 flex gap-4 items-start relative overflow-hidden bg-[#080808]/40">
                        {/* Priority glowing badge */}
                        <div className={`p-2 border rounded-xl flex-shrink-0 ${getPriorityStyles(ann.priority)}`}>
                          <Megaphone className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] font-mono font-bold tracking-wider text-muted uppercase bg-white/5 border border-white/5 rounded px-1.5 py-0.5">
                              {ann.priority}
                            </span>
                            <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {ann.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-white leading-relaxed mt-2.5">
                            {ann.content}
                          </p>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
