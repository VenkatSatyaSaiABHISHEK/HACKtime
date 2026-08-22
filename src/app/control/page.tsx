"use client";

import React, { useState } from "react";
import { useEvent, Phase } from "@/context/event-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowButton } from "@/components/ui/glow-button";
import { TimerDisplay } from "@/components/ui/timer-display";
import { LiveBadge } from "@/components/ui/live-badge";
import { CustomModal } from "@/components/ui/custom-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Plus,
  SkipForward,
  AlertOctagon,
  Users,
  Layers,
  Megaphone,
  Activity,
  Send,
  CheckCircle,
  Bell,
  UserPlus,
  ArrowRight,
  Trash2
} from "lucide-react";

export default function ControlPage() {
  const {
    phases,
    activePhaseIndex,
    timeRemaining,
    isRunning,
    isCompleted,
    participants,
    announcements,
    activities,
    startTimer,
    pauseTimer,
    addTime,
    nextPhase,
    addAnnouncement,
    updatePhase,
    deletePhase,
    endEvent
  } = useEvent();

  const [annContent, setAnnContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "critical">("normal");
  
  // Modals confirmation state
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Phase Edit State
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [editPhaseName, setEditPhaseName] = useState("");
  const [editPhaseDuration, setEditPhaseDuration] = useState<number>(0);

  const activePhase: Phase | undefined = phases[activePhaseIndex];

  const handlePhaseClick = (p: Phase) => {
    setEditingPhase(p);
    setEditPhaseName(p.name);
    setEditPhaseDuration(p.durationMinutes);
  };

  const handleSavePhase = async () => {
    if (editingPhase) {
      await updatePhase(editingPhase.id, editPhaseName, editPhaseDuration);
      setEditingPhase(null);
    }
  };

  // Calculated stats
  const participantsCount = participants.length;
  // Estimate teams: count distinct teams in list
  const distinctTeams = Array.from(new Set(participants.map(p => p.team))).filter(t => t && t !== "Solo Hacker").length;
  const soloCount = participants.filter(p => p.team === "Solo Hacker" || !p.team).length;
  const teamsCount = distinctTeams + soloCount;

  // Active Phase Progress
  let progressPercentage = 0;
  if (activePhase) {
    const totalSecs = activePhase.durationMinutes * 60;
    const elapsedSecs = totalSecs - timeRemaining;
    progressPercentage = Math.max(0, Math.min(100, Math.round((elapsedSecs / totalSecs) * 100)));
  }
  if (isCompleted) progressPercentage = 100;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annContent.trim()) return;
    addAnnouncement(annContent, priority);
    setAnnContent("");
    setPriority("normal");
  };

  const handlePauseTrigger = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "join":
        return <UserPlus className="w-3.5 h-3.5 text-success" />;
      case "announcement":
        return <Bell className="w-3.5 h-3.5 text-[#0891b2]" />;
      case "timer":
        return <Plus className="w-3.5 h-3.5 text-warning" />;
      case "phase":
        return <SkipForward className="w-3.5 h-3.5 text-primary animate-pulse" />;
      case "submit":
        return <Layers className="w-3.5 h-3.5 text-success" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-muted" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0891b2] text-glow-secondary uppercase">
              CONSOLE OPERATIONS
            </span>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight uppercase mt-0.5">
              LIVE CONTROL ROOM
            </h2>
          </div>
          <div>
            <LiveBadge status={isCompleted ? "completed" : isRunning ? "live" : "upcoming"} />
          </div>
        </div>

        {/* Primary Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Console Widget (left/center) */}
          <div className="xl:col-span-2 space-y-6">
            <GlassPanel className="p-8 border-white/10 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e]/90 to-transparent">
              <div className="absolute inset-0 bg-grid-bg opacity-[0.02] pointer-events-none" />

              <div className="flex flex-col items-center justify-center text-center py-4">
                <span className="text-xs font-mono font-bold tracking-widest text-muted uppercase">
                  {activePhase ? `${activePhase.name} ACTIVE` : "EVENT COMPLETED"}
                </span>

                {/* Countdown Display */}
                <div className="my-6 w-full">
                  <TimerDisplay seconds={timeRemaining} size="giant" />
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xl space-y-2.5 mt-2">
                  <div className="flex justify-between text-[10px] font-mono text-muted uppercase">
                    <span>ELAPSED STATUS</span>
                    <span className="text-primary text-glow-primary font-bold">
                      {progressPercentage}% Phase Complete
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Hardware-like Control Panel buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-white/5 pt-6 mt-6">
                {/* Pause/Resume Button */}
                <GlowButton
                  variant={isRunning ? "danger" : "success"}
                  size="sm"
                  onClick={handlePauseTrigger}
                  className="font-bold font-mono text-xs"
                  disabled={isCompleted}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1" /> PAUSE TIMER
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1" /> RESUME TIMER
                    </>
                  )}
                </GlowButton>

                {/* Add Time Buttons */}
                <GlowButton
                  variant="outline"
                  size="sm"
                  onClick={() => addTime(5)}
                  className="font-bold font-mono text-xs border-white/5 hover:border-white/10"
                  disabled={isCompleted}
                >
                  <Plus className="w-3.5 h-3.5 text-secondary" /> +5 MIN
                </GlowButton>
                
                <GlowButton
                  variant="outline"
                  size="sm"
                  onClick={() => addTime(10)}
                  className="font-bold font-mono text-xs border-white/5 hover:border-white/10"
                  disabled={isCompleted}
                >
                  <Plus className="w-3.5 h-3.5 text-secondary" /> +10 MIN
                </GlowButton>

                {/* Next Phase Button */}
                <GlowButton
                  variant="outline"
                  size="sm"
                  onClick={nextPhase}
                  className="font-bold font-mono text-xs border-white/5 hover:border-primary/20 hover:text-primary transition-all"
                  disabled={isCompleted || activePhaseIndex === phases.length - 1}
                >
                  NEXT PHASE <SkipForward className="w-3.5 h-3.5 ml-1" />
                </GlowButton>

                {/* End Event Button */}
                <GlowButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEndModal(true)}
                  className="font-bold font-mono text-xs col-span-2 sm:col-span-1 border-danger/20 text-danger hover:bg-danger/10 hover:border-danger/30"
                  disabled={isCompleted}
                >
                  <AlertOctagon className="w-3.5 h-3.5" /> END EVENT
                </GlowButton>
              </div>
            </GlassPanel>

            {/* Event Progress Timeline Tracker Card */}
            <GlassPanel className="border-white/5">
              <h3 className="text-xs font-mono font-bold tracking-widest text-muted uppercase mb-5">
                EVENT PHASES PROGRESSION
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {phases.map((p, idx) => {
                  const isCurrent = idx === activePhaseIndex && !isCompleted;
                  const isDone = idx < activePhaseIndex || isCompleted;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handlePhaseClick(p)}
                      className={`p-3.5 rounded-xl border relative transition-all duration-300 cursor-pointer hover:border-primary/40 group/phase ${
                        isCurrent
                          ? "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.05)]"
                          : isDone
                          ? "bg-white/5 border-white/5 opacity-60"
                          : "bg-transparent border-white/5 opacity-40"
                      }`}
                      title="Click to edit phase details"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-muted uppercase">0{idx + 1}</span>
                        {isCurrent ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                        ) : isDone ? (
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                        ) : null}
                      </div>
                      <h4 className="text-xs font-bold text-white tracking-tight leading-tight mb-1 truncate group-hover/phase:text-primary transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[10px] font-mono text-muted">
                        {p.durationMinutes} min
                      </p>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>

            {/* Telemetry data widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Online Participants", value: participantsCount, icon: <Users className="w-4 h-4 text-primary" /> },
                { label: "Active Teams", value: teamsCount, icon: <Layers className="w-4 h-4 text-[#0891b2]" /> },
                { label: "Announcements", value: announcements.length, icon: <Megaphone className="w-4 h-4 text-success" /> },
                { label: "Logged Activities", value: activities.length, icon: <Activity className="w-4 h-4 text-warning" /> }
              ].map((stat, idx) => (
                <GlassPanel key={idx} className="p-4 border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-muted uppercase block leading-none">
                      {stat.label}
                    </span>
                    <span className="text-2xl font-mono font-black text-white text-glow-primary mt-1.5 block leading-none">
                      {stat.value}
                    </span>
                  </div>
                  <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
                    {stat.icon}
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>

          {/* Side Panels (right side columns) */}
          <div className="space-y-6">
            {/* Announcement Composer */}
            <GlassPanel className="border-white/5 bg-gradient-to-b from-[#0c0c0e]/90 to-transparent">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <Megaphone className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                  BROADCAST ALERT
                </h3>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <textarea
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Type event broadcast update..."
                    className="w-full text-xs text-white bg-[#050505] border border-white/5 rounded-xl p-3 min-h-[90px] focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted"
                  />
                </div>

                {/* Priority Selector */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono tracking-wider text-muted uppercase">PRIORITY LEVEL</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["normal", "important", "critical"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1.5 px-2.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
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

                <GlowButton type="submit" variant="primary" size="sm" className="w-full">
                  Broadcast to Everyone <Send className="w-3.5 h-3.5 ml-1" />
                </GlowButton>
              </form>

              {/* Composer Live Preview */}
              {annContent.trim() && (
                <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[8px] font-mono text-muted uppercase tracking-wider block mb-1">LIVE FEED PREVIEW</span>
                  <div className={`p-2 rounded border text-[10px] leading-relaxed ${
                    priority === "critical"
                      ? "bg-danger/10 border-danger/20 text-danger"
                      : priority === "important"
                      ? "bg-warning/10 border-warning/20 text-warning"
                      : "bg-[#050505] border-white/5 text-white"
                  }`}>
                    {annContent}
                  </div>
                </div>
              )}
            </GlassPanel>

            {/* Live Activity Telemetry feed */}
            <GlassPanel className="border-white/5 flex flex-col max-h-[360px] overflow-hidden">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5 flex-shrink-0">
                <Activity className="w-4 h-4 text-secondary" />
                <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                  LIVE ACTIVITY LOGS
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar">
                <AnimatePresence initial={false}>
                  {activities.map((act) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs flex gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0 items-start font-mono"
                    >
                      <div className="p-1 bg-white/5 border border-white/5 rounded-lg mt-0.5 flex-shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white leading-relaxed">{act.description}</p>
                        <span className="text-[9px] text-muted block mt-0.5">{act.timestamp}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODALS */}
      <CustomModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={endEvent}
        title="Confirm End Hackathon?"
        description="This will end all phase timers, finalize the timeline, lock user submission capabilities, and set event status to completed. This cannot be undone."
        confirmText="Finalize Event"
        cancelText="Cancel"
        variant="danger"
      />

      {/* EDIT PHASE MODAL */}
      <CustomModal
        isOpen={!!editingPhase}
        onClose={() => setEditingPhase(null)}
        onConfirm={handleSavePhase}
        title="Edit Phase Details"
        confirmText="Save Phase"
        cancelText="Cancel"
        variant="primary"
      >
        <div className="space-y-4 my-4 text-left font-sans">
          <div>
            <label className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase block mb-1.5">
              PHASE NAME
            </label>
            <input
              type="text"
              value={editPhaseName}
              onChange={(e) => setEditPhaseName(e.target.value)}
              className="w-full text-xs text-white bg-[#050505] border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary font-sans font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase block mb-1.5">
              DURATION (MINUTES)
            </label>
            <input
              type="number"
              value={editPhaseDuration}
              onChange={(e) => setEditPhaseDuration(Number(e.target.value) || 0)}
              className="w-full text-xs text-white bg-[#050505] border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary font-mono font-bold text-[#0891b2]"
              min="1"
            />
          </div>

          {phases.length > 1 && (
            <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-6">
              <span className="text-[10px] text-muted font-mono uppercase">Danger Zone</span>
              <button
                type="button"
                onClick={async () => {
                  if (editingPhase) {
                    await deletePhase(editingPhase.id);
                    setEditingPhase(null);
                  }
                }}
                className="text-xs font-mono font-bold text-danger hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> DELETE PHASE
              </button>
            </div>
          )}
        </div>
      </CustomModal>
    </DashboardLayout>
  );
}
