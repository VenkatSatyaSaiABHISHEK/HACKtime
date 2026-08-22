"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEvent, Phase } from "@/context/event-context";
import { TimerDisplay } from "@/components/ui/timer-display";
import { LiveBadge } from "@/components/ui/live-badge";
import { RoomCode } from "@/components/ui/room-code";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowButton } from "@/components/ui/glow-button";
import {
  Megaphone,
  Users,
  Layers,
  AlertOctagon,
  ClipboardList,
  CheckCircle,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ParticipantDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const roomParam = params.roomCode as string;
  
  const {
    eventName,
    roomCode,
    phases,
    activePhaseIndex,
    timeRemaining,
    isRunning,
    isCompleted,
    announcements,
    participants,
    formConfig,
    subscribeToRoom,
    submitFormResponse
  } = useEvent();

  const [selectedTeam, setSelectedTeam] = useState("");
  const [projectName, setProjectName] = useState("");
  const [progressPercent, setProgressPercent] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Connect to the room code parameter from the URL in real-time
  useEffect(() => {
    if (roomParam) {
      const unsub = subscribeToRoom(roomParam);
      return unsub;
    }
  }, [roomParam, subscribeToRoom]);

  const activePhase: Phase | undefined = phases[activePhaseIndex];

  // Calculations
  let progressPercentage = 0;
  if (activePhase) {
    const totalSecs = activePhase.durationMinutes * 60;
    const elapsedSecs = totalSecs - timeRemaining;
    progressPercentage = Math.max(0, Math.min(100, Math.round((elapsedSecs / totalSecs) * 100)));
  }
  if (isCompleted) progressPercentage = 100;

  // Next phase details
  const nextPhase: Phase | undefined = phases[activePhaseIndex + 1];

  // Get critical announcement to display as popups
  const criticalAlert = announcements.find((a) => a.priority === "critical");

  // Get unique teams list for selection dropdown
  const uniqueTeams = Array.from(
    new Map(
      participants
        .filter((p) => p.team && p.team !== "Solo Hacker")
        .map((p) => [p.team, p])
    ).values()
  ).sort((a, b) => {
    const aCode = a.teamNumber || "";
    const bCode = b.teamNumber || "";
    const aNum = parseInt(aCode.replace(/\D/g, ""), 10);
    const bNum = parseInt(bCode.replace(/\D/g, ""), 10);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return aCode.localeCompare(bCode, undefined, { numeric: true, sensitivity: 'base' });
  });

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setSubmitting(true);
    try {
      const matched = uniqueTeams.find((t) => t.team === selectedTeam);
      const teamNumber = matched?.teamNumber || "N/A";
      
      await submitFormResponse(
        selectedTeam,
        teamNumber,
        projectName,
        progressPercent,
        {} // answers collected on dedicated /submit page
      );

      setSubmitSuccess(true);
      setProjectName("");
      setProgressPercent(50);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error("Form submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#f5f5f7] select-none relative overflow-x-hidden">
      {/* Background Visual Grids */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[10%] left-[30%] w-[50%] h-[40%] radial-glow opacity-[0.15] filter blur-[120px] pointer-events-none" />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary text-glow-primary"
            >
              <path d="M4 12h3l2-6 3 12 2-9 2 5h4" />
            </svg>
            <span className="font-bold text-white tracking-tight text-sm font-mono">
              HackPulse
            </span>
          </Link>
          <span className="h-4 w-px bg-white/10" />
          <h1 className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-xs">
            {eventName}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <LiveBadge status={isCompleted ? "completed" : isRunning ? "live" : "upcoming"} size="sm" />
          <RoomCode code={roomCode} size="sm" />
        </div>
      </header>

      {/* CRITICAL ANNOUNCEMENT SLIDE-IN ALERT */}
      <AnimatePresence>
        {criticalAlert && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="w-full bg-danger/15 border-b border-danger/30 text-danger p-3 text-center relative z-40 flex items-center justify-center gap-2 font-mono text-xs text-glow-danger"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse flex-shrink-0" />
            <span>
              <strong>CRITICAL NOTICE:</strong> {criticalAlert.content} ({criticalAlert.timestamp})
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8 relative z-10">
        
        {/* Giant Timer Dashboard */}
        <GlassPanel className="p-8 border-white/10 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e]/80 to-transparent">
          <div className="absolute inset-0 bg-grid-bg opacity-[0.02] pointer-events-none" />
          
          <div className="flex flex-col items-center justify-center text-center py-4">
            <span className="text-xs font-mono font-bold tracking-widest text-muted uppercase">
              {activePhase ? `${activePhase.name} PHASE` : "EVENT COMPLETED"}
            </span>

            {/* Countdown display */}
            <div className="my-6 w-full">
              <TimerDisplay seconds={timeRemaining} size="giant" />
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xl space-y-2 mt-2">
              <div className="flex justify-between text-[10px] font-mono text-muted uppercase">
                <span>TIME ELAPSED</span>
                <span className="text-primary font-bold">{progressPercentage}% Phase Complete</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timeline Deck Info footer */}
          <div className="flex justify-between w-full border-t border-white/5 pt-4 mt-4 text-xs font-mono text-muted">
            <div>
              <span className="block text-[9px] text-muted">CURRENT PHASE</span>
              <span className="font-bold text-white uppercase mt-0.5 block">
                {activePhase ? activePhase.name : "DONE"}
              </span>
            </div>
            
            <div className="text-right">
              {nextPhase ? (
                <div>
                  <span className="block text-[9px] text-muted">NEXT PHASE</span>
                  <span className="font-bold text-[#0891b2] uppercase mt-0.5 block">
                    {nextPhase.name} — {nextPhase.startTime}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="block text-[9px] text-muted">STATUS</span>
                  <span className="font-bold text-success uppercase mt-0.5 block">
                    COMPLETED
                  </span>
                </div>
              )}
            </div>
          </div>
        </GlassPanel>

        {/* Telemetry Stats Rows */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Online Participants", value: participants.length, icon: <Users className="w-4 h-4 text-primary" /> },
            { label: "Teams Synced", value: uniqueTeams.length || 1, icon: <Layers className="w-4 h-4 text-secondary" /> },
            { label: "Alerts Published", value: announcements.length, icon: <Megaphone className="w-4 h-4 text-success" /> }
          ].map((stat, idx) => (
            <GlassPanel key={idx} className="p-4 border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-muted uppercase block leading-none">
                  {stat.label}
                </span>
                <span className="text-xl font-mono font-black text-white text-glow-primary mt-1.5 block leading-none">
                  {stat.value}
                </span>
              </div>
              <div className="p-2 bg-white/5 border border-white/5 rounded-lg hidden sm:block">
                {stat.icon}
              </div>
            </GlassPanel>
          ))}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Column 1: Announcements Feed */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Megaphone className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                LIVE ANNOUNCEMENTS FEED
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {announcements.length === 0 ? (
                <GlassPanel className="p-6 text-center border-white/5">
                  <span className="text-xs font-mono text-muted">No messages broadcasted yet. Keep an eye here!</span>
                </GlassPanel>
              ) : (
                announcements.map((ann) => (
                  <GlassPanel
                    key={ann.id}
                    className={`p-4 border-white/5 flex gap-3.5 items-start bg-[#080808]/40 ${
                      ann.priority === "critical"
                        ? "border-danger/20"
                        : ann.priority === "important"
                        ? "border-warning/20"
                        : ""
                    }`}
                  >
                    <div className={`p-1.5 border rounded-lg flex-shrink-0 ${
                      ann.priority === "critical"
                        ? "bg-danger/10 border-danger/20 text-danger"
                        : ann.priority === "important"
                        ? "bg-warning/10 border-warning/20 text-warning"
                        : "bg-primary/10 border-primary/20 text-primary"
                    }`}>
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[9px] font-mono text-muted uppercase">
                        <span className={`font-bold ${ann.priority === "critical" ? "text-danger" : ann.priority === "important" ? "text-warning" : "text-primary"}`}>
                          {ann.priority}
                        </span>
                        <span>{ann.timestamp}</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed mt-1.5 whitespace-pre-line">
                        {ann.content}
                      </p>
                    </div>
                  </GlassPanel>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Status Submission Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <ClipboardList className="w-4 h-4 text-secondary" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                SUBMIT PROGRESS UPDATE
              </h3>
            </div>

            {formConfig?.isActive ? (
              <GlassPanel className="p-8 border-white/10 bg-[#0c0c0e]/80 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-5 min-h-[300px]">
                <div className="absolute inset-0 bg-grid-bg opacity-[0.02] pointer-events-none" />
                
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                  <ClipboardList className="w-6 h-6" />
                </div>
                
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Progress Updates Open
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    The organizers have opened the progress update submission form. Tap below to fill out your project details.
                  </p>
                </div>

                <Link href={`/event/${roomCode}/submit`} className="w-full max-w-xs">
                  <GlowButton
                    variant="secondary"
                    size="md"
                    className="w-full font-mono text-xs font-bold uppercase py-3.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Open Status Update Form <Sparkles className="w-3.5 h-3.5" />
                  </GlowButton>
                </Link>
              </GlassPanel>
            ) : (
              <GlassPanel className="p-8 text-center border-white/5 bg-[#080808]/20 flex flex-col items-center justify-center space-y-3 min-h-[300px]">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-muted">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wide">
                  Submissions Stopped
                </h4>
                <p className="text-[10px] text-muted max-w-xs leading-relaxed">
                  The organizers have closed the progress submission form for this phase. Keep an eye on announcements for updates!
                </p>
              </GlassPanel>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
