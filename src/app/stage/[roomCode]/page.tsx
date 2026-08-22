"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEvent, Phase } from "@/context/event-context";
import { TimerDisplay } from "@/components/ui/timer-display";
import { Minimize, Maximize, Sun, Moon } from "lucide-react";

export default function StageModePage() {
  const params = useParams();
  const router = useRouter();
  const { eventName, eventLogo, roomCode, phases, activePhaseIndex, timeRemaining, isRunning, isCompleted, subscribeToRoom } = useEvent();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const roomCodeParam = params.roomCode as string;

  // Mount subscription to current route code
  useEffect(() => {
    if (roomCodeParam) {
      const unsub = subscribeToRoom(roomCodeParam);
      return unsub;
    }
  }, [roomCodeParam, subscribeToRoom]);

  const activePhase: Phase | undefined = phases[activePhaseIndex];

  // Handle HTML5 fullscreen toggling
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err.message);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Theme support
  useEffect(() => {
    const savedTheme = localStorage.getItem("hackpulse-theme");
    if (savedTheme === "light") {
      setIsLightMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isLightMode;
    setIsLightMode(nextMode);
    localStorage.setItem("hackpulse-theme", nextMode ? "light" : "dark");
  };

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: isLightMode ? "#f8f9fa" : "#020202",
        color: isLightMode ? "#111827" : "#f5f5f7",
      }}
      className={`fixed inset-0 w-screen h-screen z-50 flex flex-col justify-between p-8 sm:p-12 overflow-hidden select-none transition-colors duration-300 ${
        isLightMode ? "light-theme" : ""
      }`}
    >
      {/* Background visual styles (Only in Dark Mode) */}
      {!isLightMode && (
        <>
          <div className="absolute inset-0 grid-bg-animated opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
          <div className="scanline-bar" />
          
          {/* Floating ambient radial lights */}
          <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] radial-glow opacity-[0.12] filter blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] secondary-glow opacity-[0.08] filter blur-[150px] pointer-events-none" />
        </>
      )}

      {/* TOP DECK HEADER */}
      <header className="flex justify-between items-center w-full relative z-10">
        <div className="flex items-center gap-3">
          {eventLogo ? (
            <img
              src={eventLogo}
              alt="Logo"
              className="w-9 h-9 object-contain rounded-xl border border-white/10 bg-black/20 p-1"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12h3l2-6 3 12 2-9 2 5h4" />
              </svg>
            </div>
          )}
          <span className={`font-bold tracking-widest text-lg font-mono uppercase ${isLightMode ? "text-[#111827]" : "text-white"}`}>
            {eventName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all cursor-pointer"
            title={isLightMode ? "Switch to Dark Mode" : "Switch to Day Mode"}
          >
            {isLightMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
          </button>

          {/* Fullscreen controller */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* CENTER COUNTDOWN DISPLAY */}
      <section className="flex-1 flex flex-col items-center justify-center text-center my-6 relative z-10 w-full animate-fade-in">
        <div className="space-y-6 max-w-4xl w-full">
          <span className="text-sm sm:text-lg font-mono font-bold tracking-[0.25em] text-[#0891b2] text-glow-secondary uppercase">
            {activePhase ? `${activePhase.name} PHASE` : "EVENT WRAPPED"}
          </span>

          {/* Clock timer display - Giant size */}
          <div className="w-full">
            <TimerDisplay seconds={timeRemaining} size="giant" theme={isLightMode ? "light" : "dark"} />
          </div>
        </div>
      </section>

      {/* Footer balance spacer */}
      <div className="h-6" />
    </div>
  );
}
