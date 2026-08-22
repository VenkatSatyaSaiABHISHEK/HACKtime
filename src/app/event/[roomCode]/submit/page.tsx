"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEvent } from "@/context/event-context";
import {
  CheckCircle,
  FileText,
  ArrowRight,
  AlignLeft,
  BarChart2,
  ChevronLeft,
  Search,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubmitProgressPage() {
  const params = useParams();
  const roomParam = params.roomCode as string;

  const {
    eventName,
    roomCode,
    participants,
    formConfig,
    subscribeToRoom,
    submitFormResponse,
  } = useEvent();

  const questions = formConfig?.questions ?? [];
  const totalCards = 1 + questions.length;

  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (roomParam) {
      const unsub = subscribeToRoom(roomParam);
      return unsub;
    }
  }, [roomParam, subscribeToRoom]);

  useEffect(() => {
    if (formConfig !== undefined) setLoaded(true);
  }, [formConfig]);

  const uniqueTeams = Array.from(
    new Map(participants.filter((p) => p.team).map((p) => [p.team, p])).values()
  ).sort((a, b) => {
    const aNum = parseInt((a.teamNumber || "").replace(/\D/g, ""), 10);
    const bNum = parseInt((b.teamNumber || "").replace(/\D/g, ""), 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return (a.teamNumber || "").localeCompare(b.teamNumber || "", undefined, { numeric: true });
  });

  const setAnswer = (id: string, val: string) =>
    setAnswers((prev) => ({ ...prev, [id]: val }));

  const canAdvance = () => {
    if (currentCard === 0) return selectedTeam.trim() !== "";
    const q = questions[currentCard - 1];
    if (!q) return false;
    if (q.type === "progress") return true;
    return (answers[q.id] || "").trim() !== "";
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection(1);
    setCurrentCard((c) => c + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentCard((c) => c - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const matched = uniqueTeams.find((t) => t.team === selectedTeam);
      const teamNumber = matched?.teamNumber || "N/A";
      const finalAnswers = { ...answers };
      questions.forEach((q) => {
        if (q.type === "progress" && !finalAnswers[q.id]) finalAnswers[q.id] = "50";
      });
      await submitFormResponse(selectedTeam, teamNumber, "", 0, finalAnswers);
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setSelectedTeam("");
    setAnswers({});
    setCurrentCard(0);
    setDirection(1);
    setTeamSearch("");
  };

  const isLastCard = currentCard === totalCards - 1;
  const progress = Math.round((currentCard / totalCards) * 100);

  // ── Loading ──
  if (!loaded && !submitSuccess) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center font-sans">
        <div className="text-center space-y-5">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-purple-900/50" />
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
          </div>
          <p className="text-xs font-mono text-gray-600 tracking-widest uppercase">Loading form…</p>
        </div>
      </div>
    );
  }

  // ── Closed ──
  if (loaded && !formConfig?.isActive && !submitSuccess) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center px-4 font-sans">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Form is currently closed</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              The submission form is not open right now. Check with your organizer for updates.
            </p>
          </div>
          <p className="text-xs font-mono text-gray-700">Room: {roomCode}</p>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center px-4 font-sans">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full"
        >
          {/* Glow blob */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative bg-[#0d0d10] border border-white/[0.07] rounded-3xl p-10 text-center space-y-7 shadow-2xl shadow-black/50">
            {/* Animated checkmark ring */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-green-500/10 border border-green-500/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Response recorded!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your team's progress has been sent to the organizers. They can see it in real time.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all cursor-pointer text-sm shadow-lg shadow-purple-900/30"
            >
              Submit another response
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="min-h-screen bg-[#060608] flex flex-col font-sans overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-900/15 rounded-full blur-3xl" />
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-20 w-full px-5 pt-5 pb-4 flex items-center gap-4">
        {/* Back button (only on question cards) */}
        <div className="w-16 flex-shrink-0">
          {currentCard > 0 && (
            <button
              onClick={goPrev}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] font-mono text-gray-700 whitespace-nowrap">
            {currentCard} <span className="text-gray-800">/ {totalCards}</span>
          </span>
        </div>

        {/* Room code */}
        <div className="w-16 flex-shrink-0 text-right">
          <span className="text-[10px] font-mono text-purple-700 font-bold">{roomCode}</span>
        </div>
      </header>

      {/* ── Card stage ── */}
      <div className="relative z-10 flex-1 flex flex-col px-4 py-4 pb-24">
        <div className="w-full max-w-lg mx-auto flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ── Card 0: Team picker ── */}
            {currentCard === 0 && (
              <SlideCard key="team" direction={direction}>
                {/* Step dots */}
                <StepDots current={1} total={totalCards} />

                <div className="space-y-2 mt-1">
                  <p className="text-[10px] font-mono text-purple-500 uppercase tracking-[0.2em]">{eventName}</p>
                  <h1 className="text-2xl sm:text-[2rem] font-black text-white leading-tight">
                    Which team<br />are you on?
                  </h1>
                  <p className="text-sm text-gray-600">Pick your team from the list below.</p>
                </div>

                {/* Search */}
                <div className="relative mt-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search teams…"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-purple-600/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>

                {/* Team list */}
                <div className="space-y-2 max-h-44 sm:max-h-56 overflow-y-auto pr-0.5 mt-1">
                  {uniqueTeams
                    .filter((t) =>
                      t.team.toLowerCase().includes(teamSearch.toLowerCase()) ||
                      (t.teamNumber || "").includes(teamSearch)
                    )
                    .map((t) => {
                      const sel = selectedTeam === t.team;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTeam(t.team)}
                          className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            sel
                              ? "bg-purple-600/15 border-purple-500/40 shadow-lg shadow-purple-950/40"
                              : "bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10"
                          }`}
                        >
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black font-mono flex-shrink-0 ${
                            sel ? "bg-purple-600 text-white" : "bg-white/[0.05] border border-white/10 text-gray-500"
                          }`}>
                            {t.teamNumber && t.teamNumber !== "N/A" ? t.teamNumber : "#"}
                          </span>
                          <span className={`text-sm font-semibold flex-1 ${sel ? "text-white" : "text-gray-400"}`}>
                            {t.team}
                          </span>
                          {sel && <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  {uniqueTeams.filter((t) =>
                    t.team.toLowerCase().includes(teamSearch.toLowerCase()) ||
                    (t.teamNumber || "").includes(teamSearch)
                  ).length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-8 text-gray-700">
                      <Users className="w-5 h-5" />
                      <p className="text-xs font-mono">No teams found</p>
                    </div>
                  )}
                </div>

                <NextButton onClick={goNext} disabled={!canAdvance()} label="Next" isLast={false} />
              </SlideCard>
            )}

            {/* ── Cards 1+: Questions ── */}
            {currentCard > 0 && (() => {
              const q = questions[currentCard - 1];
              if (!q) return null;
              const isProgress = q.type === "progress";
              const val = answers[q.id] ?? (isProgress ? "50" : "");
              const pct = isProgress ? Number(val) : 0;

              return (
                <SlideCard key={q.id} direction={direction}>
                  <StepDots current={currentCard + 1} total={totalCards} />

                  <div className="space-y-2 mt-1">
                    {/* Type pill */}
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      isProgress
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    }`}>
                      {isProgress ? <BarChart2 className="w-2.5 h-2.5" /> : <AlignLeft className="w-2.5 h-2.5" />}
                      {isProgress ? "Progress" : "Text"}
                    </span>

                    <h1 className="text-2xl sm:text-[1.8rem] font-black text-white leading-tight">
                      {q.text}
                    </h1>
                  </div>

                  {isProgress ? (
                    <div className="space-y-5 mt-2">
                      {/* Giant % */}
                      <div className="text-center py-2">
                        <span className="text-[4rem] sm:text-[5.5rem] font-black leading-none tabular-nums bg-gradient-to-br from-white to-purple-300 bg-clip-text text-transparent">
                          {pct}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-purple-400">%</span>
                      </div>
                      {/* Bar */}
                      <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.07]">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 rounded-full"
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.08 }}
                        />
                      </div>
                      <input
                        type="range" min="0" max="100" step="5"
                        value={pct}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        className="w-full h-1.5 accent-purple-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-gray-700">
                        <span>0%</span><span>50%</span><span>100%</span>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      autoFocus
                      rows={4}
                      value={val}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Type your answer here…"
                      className="w-full mt-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-purple-600/50 focus:bg-white/[0.06] transition-all leading-relaxed resize-none"
                    />
                  )}

                  <NextButton
                    onClick={isLastCard ? handleSubmit : goNext}
                    disabled={!canAdvance() || submitting}
                    label={isLastCard ? (submitting ? "Submitting…" : "Submit") : "Next"}
                    isLast={isLastCard}
                  />
                </SlideCard>
              );
            })()}
          </AnimatePresence>

          {/* Keyboard hint — desktop only */}
          {!isLastCard && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-[10px] text-gray-800 mt-5 font-mono hidden sm:block"
            >
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/[0.08] rounded text-gray-700 text-[10px]">
                Enter ↵
              </kbd>{" "}
              to continue
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Slide card wrapper ──
const variants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.98 }),
};

function SlideCard({ children, direction }: { children: React.ReactNode; direction: number }) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-[#0d0d10] border border-white/[0.07] rounded-3xl p-5 sm:p-8 md:p-10 space-y-5 shadow-2xl shadow-black/60"
    >
      {/* Subtle inner glow top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-600/30 to-transparent rounded-t-3xl" />
      {children}
    </motion.div>
  );
}

// ── Step dots ──
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-gray-700">
        {current} <span className="text-gray-800">/ {total}</span>
      </span>
      <div className="flex gap-1 items-center">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-[3px] rounded-full transition-all duration-400 ${
              i < current
                ? "bg-purple-500 w-5"
                : i === current - 1
                ? "bg-purple-400 w-5"
                : "bg-white/[0.07] w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Next / Submit button ──
function NextButton({ onClick, disabled, label, isLast }: {
  onClick: () => void; disabled: boolean; label: string; isLast: boolean;
}) {
  return (
    <>
      {/* Desktop inline button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`hidden sm:flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:cursor-not-allowed mt-1 ${
          isLast
            ? "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white shadow-green-900/30"
            : "bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white shadow-purple-900/40"
        }`}
      >
        {label}
        {isLast ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </button>

      {/* Mobile sticky bottom button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#060608] via-[#060608]/90 to-transparent">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:cursor-not-allowed ${
            isLast
              ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-green-900/40"
              : "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-purple-900/50"
          }`}
        >
          {label}
          {isLast ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
