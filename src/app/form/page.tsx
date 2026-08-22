"use client";

import React, { useState, useEffect } from "react";
import { useEvent, FormQuestion } from "@/context/event-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowButton } from "@/components/ui/glow-button";
import {
  FileText,
  Play,
  Pause,
  Copy,
  Check,
  ClipboardList,
  Trash2,
  AlertCircle,
  Clock,
  Plus,
  GripVertical,
  ExternalLink,
  AlignLeft,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type QuestionType = "text" | "progress";

const TYPE_OPTIONS: { type: QuestionType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    type: "text",
    label: "Text Answer",
    icon: <AlignLeft className="w-3.5 h-3.5" />,
    desc: "Student types a text response",
  },
  {
    type: "progress",
    label: "Progress Bar",
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    desc: "Student drags a % slider",
  },
];

export default function FormBuilderPage() {
  const { roomCode, formConfig, submissions, updateFormConfig, deleteSubmission } = useEvent();

  const [isActive, setIsActive] = useState(formConfig?.isActive ?? false);
  const [questions, setQuestions] = useState<FormQuestion[]>(formConfig?.questions ?? []);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<"dash" | "form" | null>(null);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  useEffect(() => {
    if (formConfig) {
      setIsActive(formConfig.isActive);
      setQuestions(formConfig.questions ?? []);
    }
  }, [formConfig]);

  const addQuestion = () => {
    const newQ: FormQuestion = {
      id: `q_${Date.now()}`,
      text: "",
      type: "text",
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const updateQuestion = (id: string, patch: Partial<FormQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = questions.filter((q) => q.text.trim() !== "");
    setSaving(true);
    try {
      await updateFormConfig(isActive, valid);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (type: "dash" | "form") => {
    if (typeof window !== "undefined") {
      const path = type === "dash" ? `/event/${roomCode}` : `/event/${roomCode}/submit`;
      navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#0891b2] uppercase">
            STUDENT STATUS FORMS
          </span>
          <h2 className="text-2xl font-black text-white font-mono tracking-tight uppercase mt-0.5">
            FORM BUILDER & RESPONSES
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ─── LEFT: Builder ─── */}
          <div className="lg:col-span-1 space-y-5">
            <form onSubmit={handleSave} className="space-y-5">
              <GlassPanel className="p-6 border-white/5 bg-[#080808]/40 space-y-5">
                <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> FORM DESIGNER
                </h3>

                {/* Status toggle */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block">
                    Form Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsActive(true)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
                          : "bg-white/5 border-white/5 text-muted hover:text-white"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" /> Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActive(false)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        !isActive
                          ? "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
                          : "bg-white/5 border-white/5 text-muted hover:text-white"
                      }`}
                    >
                      <Pause className="w-3.5 h-3.5" /> Stop
                    </button>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase">
                      Questions ({questions.length})
                    </label>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-primary hover:underline cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Question
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {questions.map((q, idx) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border border-white/5 rounded-2xl bg-black/20 overflow-hidden"
                      >
                        {/* Question text row */}
                        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                          <GripVertical className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                          <span className="text-[9px] font-mono text-muted flex-shrink-0">Q{idx + 1}</span>
                          <input
                            type="text"
                            value={q.text}
                            required
                            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                            placeholder="Type your question..."
                            className="flex-1 bg-transparent border-none outline-none text-xs text-white font-sans placeholder:text-muted/40 min-w-0"
                          />
                          <button
                            type="button"
                            onClick={() => removeQuestion(q.id)}
                            className="flex-shrink-0 p-1.5 border border-white/5 bg-white/5 hover:border-danger hover:bg-danger/10 text-muted hover:text-danger rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Answer type selector */}
                        <div className="px-3 pb-3 flex gap-2">
                          {TYPE_OPTIONS.map((opt) => (
                            <button
                              key={opt.type}
                              type="button"
                              onClick={() => updateQuestion(q.id, { type: opt.type })}
                              title={opt.desc}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                                q.type === opt.type
                                  ? opt.type === "text"
                                    ? "bg-[#0891b2]/10 border-[#0891b2]/30 text-[#0891b2]"
                                    : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                  : "bg-white/5 border-white/5 text-muted hover:text-white"
                              }`}
                            >
                              {opt.icon}
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {questions.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-muted font-mono">
                        No questions yet — click Add Question above.
                      </p>
                    </div>
                  )}
                </div>

                <GlowButton
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full font-mono text-xs font-bold uppercase py-3"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save & Publish Form"}
                </GlowButton>
              </GlassPanel>
            </form>

            {/* Share Links */}
            <GlassPanel className="p-5 border-white/5 bg-[#080808]/40 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase">
                SHARE WITH STUDENTS
              </h3>

              <div>
                <p className="text-[9px] font-mono text-muted uppercase mb-1.5">Participant Dashboard</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-primary flex items-center truncate">
                    /event/{roomCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("dash")}
                    className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-all"
                    title="Copy dashboard link"
                  >
                    {copied === "dash" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-mono text-muted uppercase mb-1.5">Direct Form Link</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-secondary flex items-center truncate">
                    /event/{roomCode}/submit
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("form")}
                    className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-all"
                    title="Copy form link"
                  >
                    {copied === "form" ? <Check className="w-4 h-4 text-success" /> : <ExternalLink className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* ─── RIGHT: Responses ─── */}
          <div className="lg:col-span-2">
            <GlassPanel className="p-6 border-white/5 bg-[#080808]/40 space-y-4 min-h-[450px]">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-secondary" /> STUDENT RESPONSES ({submissions.length})
                </h3>
              </div>

              {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
                  <div className="w-12 h-12 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-muted">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                      No updates submitted yet
                    </p>
                    <p className="text-[10px] text-muted max-w-xs leading-relaxed">
                      Enable the form and share the link. Responses appear here in real time.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {submissions.map((sub) => {
                      const isExpanded = expandedSubmission === sub.id;
                      const answerEntries = Object.entries(sub.answers || {});
                      return (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="border border-white/5 rounded-2xl overflow-hidden bg-black/20"
                        >
                          {/* Summary row */}
                          <div
                            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => setExpandedSubmission(isExpanded ? null : sub.id)}
                          >
                            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-sm text-primary select-none">
                              {sub.teamName.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-sm leading-tight truncate">{sub.teamName}</p>
                              <p className="text-[9px] font-mono text-muted mt-0.5">
                                Code {sub.teamNumber} &bull;{" "}
                                <span className="text-[#0891b2]">{sub.projectName}</span>
                              </p>
                            </div>

                            <div className="hidden sm:block w-28 space-y-1 flex-shrink-0">
                              <span className="text-[9px] font-mono font-bold text-secondary block text-right">
                                {sub.progressPercent}%
                              </span>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                  style={{ width: `${sub.progressPercent}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[9px] font-mono text-muted hidden lg:flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {sub.timestamp}
                              </span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await deleteSubmission(sub.id);
                                }}
                                className="p-1.5 border border-white/5 bg-white/5 hover:border-danger hover:bg-danger/10 text-muted hover:text-danger rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded answers */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3 overflow-hidden"
                              >
                                {answerEntries.length === 0 ? (
                                  <p className="text-[10px] text-muted font-mono">No question answers recorded.</p>
                                ) : (
                                  answerEntries.map(([qId, answer], idx) => {
                                    const question = formConfig?.questions?.find((q) => q.id === qId);
                                    const isProgress = question?.type === "progress";
                                    const pct = isProgress ? Number(answer) : 0;
                                    return (
                                      <div key={qId} className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                          {isProgress
                                            ? <BarChart2 className="w-3 h-3 text-purple-400" />
                                            : <AlignLeft className="w-3 h-3 text-[#0891b2]" />
                                          }
                                          <p className="text-[9px] font-mono text-muted uppercase tracking-wider">
                                            Q{idx + 1}: {question?.text || `Question ${idx + 1}`}
                                          </p>
                                        </div>
                                        {isProgress ? (
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-mono">
                                              <span className="text-muted">Progress</span>
                                              <span className="text-purple-400 font-bold">{pct}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                              <div
                                                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-white font-sans leading-relaxed bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2">
                                            {answer}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
