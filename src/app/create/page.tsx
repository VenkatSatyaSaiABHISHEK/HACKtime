"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvent } from "@/context/event-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Play
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowButton } from "@/components/ui/glow-button";

interface LocalPhase {
  name: string;
  duration: number; // in minutes
}

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent } = useEvent();
  
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState("AI Innovation Hackathon");
  const [eventDesc, setEventDesc] = useState("The ultimate challenge to build futuristic AI applications.");
  const [phases, setPhases] = useState<LocalPhase[]>([
    { name: "Opening Ceremony", duration: 30 },
    { name: "Hacking Phase", duration: 600 },
    { name: "Submission Portal", duration: 45 },
    { name: "Judging Round", duration: 90 },
    { name: "Closing Ceremony & Results", duration: 30 },
  ]);

  const [error, setError] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  // Form field focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleAddPhase = () => {
    setPhases([...phases, { name: `Phase ${phases.length + 1}`, duration: 60 }]);
  };

  const handleRemovePhase = (index: number) => {
    if (phases.length <= 1) {
      setError("At least one phase is required.");
      return;
    }
    setError("");
    setPhases(phases.filter((_, idx) => idx !== index));
  };

  const handleUpdatePhase = (index: number, fields: Partial<LocalPhase>) => {
    setPhases(
      phases.map((p, idx) => (idx === index ? { ...p, ...fields } : p))
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!eventName.trim()) {
        setError("Event Name is required.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      // Validate phases
      const emptyPhases = phases.some((p) => !p.name.trim() || p.duration <= 0);
      if (emptyPhases) {
        setError("All phases must have a valid name and a duration greater than 0.");
        return;
      }
      setError("");
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    // Simulate launching loader animation
    setTimeout(async () => {
      await createEvent(eventName, phases);
      router.push("/control");
    }, 2500);
  };

  const totalDurationMinutes = phases.reduce((acc, p) => acc + p.duration, 0);
  const formatDuration = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  // Step transitions
  const stepVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 } as any,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 } as any,
    }),
  };

  const dir = step; // simple direction mapping

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 bg-[#050505]">
      {/* Animated grids and ambient light */}
      <div className="absolute inset-0 grid-bg opacity-[0.06] z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] radial-glow opacity-25 filter blur-[100px] z-0 pointer-events-none" />

      {isLaunching ? (
        /* LAUNCHING STATE (Beautiful full-screen loader) */
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm">
          <div className="relative w-24 h-24 mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-2 rounded-full border-b-2 border-l-2 border-secondary opacity-70"
            />
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30"
            >
              <Check className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
          
          <motion.h2
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-2xl font-black text-white font-mono tracking-widest uppercase"
          >
            LAUNCHING ROOM
          </motion.h2>
          <p className="text-xs text-muted font-mono uppercase tracking-wider mt-2">
            Configuring telemetry, synced clocks & stage displays...
          </p>
        </div>
      ) : (
        /* WIZARD CARD */
        <div className="relative z-10 w-full max-w-xl">
          {/* Logo link */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 select-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <path d="M4 12h3l2-6 3 12 2-9 2 5h4" />
              </svg>
              <span className="font-mono text-xs tracking-widest font-black text-white uppercase">HACKPULSE OPERATING SYSTEM</span>
            </div>
          </div>

          <GlassPanel className="border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Step Progress Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      step >= s
                        ? "bg-primary/20 border-primary text-white text-glow-primary"
                        : "bg-transparent border-white/5 text-muted"
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">WIZARD PHASE</span>
                <p className="text-xs font-bold text-white uppercase tracking-tight">
                  {step === 1 ? "Details" : step === 2 ? "Configure Timeline" : "Final Review"}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-2 text-xs text-danger font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Steps Container */}
            <div className="min-h-[220px]">
              <AnimatePresence mode="wait" custom={dir}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={dir}
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6"
                  >
                    {/* Event Name Input */}
                    <div className="relative">
                      <label className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase block mb-2">
                        EVENT NAME
                      </label>
                      <div
                        className={`flex items-center border rounded-xl px-4 py-3 bg-[#050505]/40 transition-all duration-300 ${
                          focusedField === "name"
                            ? "border-primary shadow-[0_0_15px_rgba(124,58,237,0.15)] bg-black"
                            : "border-white/10"
                        }`}
                      >
                        <Calendar className="w-4 h-4 text-muted mr-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          className="bg-transparent text-sm text-white font-medium focus:outline-none w-full"
                          placeholder="e.g. AI Innovation Hackathon"
                        />
                      </div>
                    </div>

                    {/* Event Description Input */}
                    <div>
                      <label className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase block mb-2">
                        EVENT DESCRIPTION
                      </label>
                      <div
                        className={`flex items-start border rounded-xl px-4 py-3 bg-[#050505]/40 transition-all duration-300 ${
                          focusedField === "desc"
                            ? "border-primary shadow-[0_0_15px_rgba(124,58,237,0.15)] bg-black"
                            : "border-white/10"
                        }`}
                      >
                        <textarea
                          value={eventDesc}
                          onChange={(e) => setEventDesc(e.target.value)}
                          onFocus={() => setFocusedField("desc")}
                          onBlur={() => setFocusedField(null)}
                          className="bg-transparent text-sm text-white focus:outline-none w-full min-h-[80px] resize-none"
                          placeholder="Provide a description of your event..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={dir}
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4 max-h-[300px] overflow-y-auto pr-2"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase">
                        HACKATHON PHASES ({phases.length})
                      </span>
                      <button
                        onClick={handleAddPhase}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-primary hover:text-white uppercase focus:outline-none cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD PHASE
                      </button>
                    </div>

                    <div className="space-y-3">
                      {phases.map((phase, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl transition-all hover:border-white/10"
                        >
                          {/* Phase name */}
                          <input
                            type="text"
                            value={phase.name}
                            onChange={(e) => handleUpdatePhase(idx, { name: e.target.value })}
                            className="bg-transparent text-xs font-bold text-white focus:outline-none border-b border-transparent focus:border-primary pb-0.5 flex-1"
                            placeholder="Phase Name"
                          />

                          {/* Phase duration */}
                          <div className="flex items-center gap-1 bg-[#050505] border border-white/5 rounded-lg px-2 py-1">
                            <Clock className="w-3 h-3 text-muted" />
                            <input
                              type="number"
                              value={phase.duration}
                              onChange={(e) =>
                                handleUpdatePhase(idx, { duration: parseInt(e.target.value) || 0 })
                              }
                              className="bg-transparent text-xs font-mono font-bold text-[#0891b2] text-center w-12 focus:outline-none"
                              min="1"
                            />
                            <span className="text-[9px] font-mono text-muted uppercase">MIN</span>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => handleRemovePhase(idx)}
                            className="text-muted hover:text-danger p-1 transition-colors cursor-pointer"
                            title="Delete phase"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={dir}
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-5"
                  >
                    <div className="border border-white/5 bg-white/5 rounded-2xl p-4 space-y-4">
                      <div>
                        <span className="text-[9px] font-mono text-muted uppercase tracking-wider">EVENT NAME</span>
                        <p className="text-sm font-bold text-white mt-0.5">{eventName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-muted uppercase tracking-wider">DESCRIPTION</span>
                        <p className="text-xs text-muted leading-relaxed mt-0.5">{eventDesc || "No description provided."}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div>
                          <span className="text-[9px] font-mono text-muted uppercase tracking-wider">TOTAL TIMELINE PHASES</span>
                          <p className="text-sm font-bold text-white mt-0.5 font-mono">{phases.length} Phases</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-muted uppercase tracking-wider">ESTIMATED RUNTIME</span>
                          <p className="text-sm font-bold text-secondary mt-0.5 font-mono">{formatDuration(totalDurationMinutes)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-white/5 rounded-2xl p-4 bg-[#050505]/40 max-h-[140px] overflow-y-auto">
                      <span className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">TIMELINE PREVIEW</span>
                      <div className="space-y-2 font-mono">
                        {phases.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-muted">
                            <span className="truncate max-w-[200px] text-white font-bold">{idx + 1}. {p.name}</span>
                            <span>{p.duration} mins</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
              {step > 1 ? (
                <GlowButton variant="outline" size="sm" onClick={handlePrevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </GlowButton>
              ) : (
                <Link href="/">
                  <GlowButton variant="ghost" size="sm">
                    Cancel
                  </GlowButton>
                </Link>
              )}

              {step < 3 ? (
                <GlowButton variant="primary" size="sm" onClick={handleNextStep}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </GlowButton>
              ) : (
                <GlowButton variant="success" size="sm" onClick={handleLaunch}>
                  Launch Event Room <Play className="w-4 h-4 ml-1.5" />
                </GlowButton>
              )}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
