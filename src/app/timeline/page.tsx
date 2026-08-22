"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { useEvent, Phase } from "@/context/event-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowButton } from "@/components/ui/glow-button";
import { LiveBadge } from "@/components/ui/live-badge";
import { Plus, Trash2, Edit2, Check, Clock, Calendar, ArrowRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimelinePage() {
  const {
    phases,
    activePhaseIndex,
    timeRemaining,
    isCompleted,
    addTime,
    updatePhase,
    deletePhase
  } = useEvent();

  // Local state to simulate editing phase info
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState(0);

  const handleEditClick = (phase: Phase) => {
    setEditingPhaseId(phase.id);
    setEditName(phase.name);
    setEditDuration(phase.durationMinutes);
  };

  const handleSave = async (phaseId: string) => {
    await updatePhase(phaseId, editName, editDuration);
    setEditingPhaseId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0891b2] text-glow-secondary uppercase">
              TIMELINE SCHEDULING
            </span>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight uppercase mt-0.5">
              EVENT TIMELINE
            </h2>
          </div>
          <div>
            <div className="flex gap-2">
              <span className="text-xs font-mono bg-white/5 border border-white/5 rounded-lg px-3 py-1 text-muted">
                TOTAL: {phases.length} PHASES
              </span>
              <span className="text-xs font-mono bg-primary/10 border border-primary/20 rounded-lg px-3 py-1 text-primary">
                RUNTIME: {phases.reduce((acc, p) => acc + p.durationMinutes, 0)} MIN
              </span>
            </div>
          </div>
        </div>

        {/* Timeline details */}
        <div className="space-y-4">
          <AnimatePresence>
            {phases.map((p, idx) => {
              const isCurrent = idx === activePhaseIndex && !isCompleted;
              const isDone = idx < activePhaseIndex || isCompleted;
              const isEditing = editingPhaseId === p.id;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative"
                >
                  <GlassPanel
                    className={`p-6 border transition-all duration-300 relative ${
                      isCurrent
                        ? "border-primary/40 bg-gradient-to-r from-primary/5 via-[#080808]/40 to-[#080808]/40 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
                        : "border-white/5 bg-[#080808]/40"
                    }`}
                  >
                    {/* Flashing current indicator border glow */}
                    {isCurrent && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary rounded-l-2xl text-glow-primary animate-pulse" />
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left Block: Index & Status */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-white">
                          0{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-[#050505] border border-white/10 rounded px-2 py-0.5 text-sm font-bold text-white focus:outline-none focus:border-primary"
                              />
                            ) : (
                              <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                                {p.name}
                              </h3>
                            )}
                            {isCurrent && <LiveBadge status="live" size="sm" />}
                            {isDone && <LiveBadge status="completed" size="sm" />}
                            {!isCurrent && !isDone && <LiveBadge status="upcoming" size="sm" />}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted font-mono mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {p.startTime} - {p.endTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Block: Duration & Progress */}
                      <div className="flex-1 max-w-md">
                        {isCurrent ? (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-mono text-muted uppercase">
                              <span>ACTIVE TIMER REMAINING</span>
                              <span>{Math.round((timeRemaining / (p.durationMinutes * 60)) * 100)}% Left</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${Math.max(0, Math.min(100, (timeRemaining / (p.durationMinutes * 60)) * 100))}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-mono text-muted">
                            <Clock className="w-4 h-4 text-muted" />
                            <span>DURATION:</span>
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editDuration}
                                  onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                                  className="w-16 bg-[#050505] border border-white/10 rounded px-2 py-0.5 text-xs text-white text-center font-bold font-mono"
                                />
                                <span>MIN</span>
                              </div>
                            ) : (
                              <span className="text-white font-bold">{p.durationMinutes} minutes</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Block: Operations */}
                      <div className="flex items-center gap-2.5 justify-end">
                        {isEditing ? (
                          <GlowButton
                            variant="success"
                            size="sm"
                            onClick={() => handleSave(p.id)}
                            className="font-mono text-xs py-1.5 px-3"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> SAVE
                          </GlowButton>
                        ) : (
                          <>
                            {isCurrent && (
                              <GlowButton
                                variant="outline"
                                size="sm"
                                onClick={() => addTime(5)}
                                className="border-white/5 text-xs py-1.5 px-3 font-mono font-bold"
                              >
                                +5 MIN
                              </GlowButton>
                            )}
                            <GlowButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(p)}
                              className="border-white/5 text-xs py-1.5 px-3"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" /> EDIT
                            </GlowButton>
                            {phases.length > 1 && (
                              <GlowButton
                                variant="outline"
                                size="sm"
                                onClick={() => deletePhase(p.id)}
                                className="border-white/5 text-xs py-1.5 px-2 bg-danger/5 hover:bg-danger/10 border-danger/10 hover:border-danger/30 text-danger"
                                title="Delete Phase"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </GlowButton>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Warning Alert banner */}
        <GlassPanel className="border-danger/20 bg-danger/5 p-4 flex gap-3 items-start">
          <ShieldAlert className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              REAL-TIME SYNCHRONIZATION ALERT
            </h4>
            <p className="text-xs text-muted leading-relaxed mt-1">
              Any changes made to the timeline phases, name identifiers, or durations will instantly broadcast to all active participant dashboards and stage projector displays. Check with event floor managers before saving edits.
            </p>
          </div>
        </GlassPanel>
      </div>
    </DashboardLayout>
  );
}
