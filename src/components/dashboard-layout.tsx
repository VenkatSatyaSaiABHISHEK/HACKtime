"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEvent } from "@/context/event-context";
import {
  Activity,
  Clock,
  Users,
  Megaphone,
  Settings,
  Radio,
  Wifi,
  Menu,
  X,
  Play,
  Pause,
  LogOut,
  Maximize2,
  Lock,
  Loader2,
  Sun,
  Moon,
  FileText,
  Clipboard
} from "lucide-react";
import { LiveBadge } from "./ui/live-badge";
import { RoomCode } from "./ui/room-code";
import { CustomModal } from "./ui/custom-modal";
import { GlowButton } from "./ui/glow-button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    eventName,
    eventLogo,
    roomCode,
    isRunning,
    isCompleted,
    resetEvent,
    user,
    authLoading,
    signInWithGoogle,
    signOutUser
  } = useEvent();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

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

  const menuItems = [
    { name: "Overview", href: "/control", icon: <Activity className="w-4 h-4" /> },
    { name: "Timeline", href: "/timeline", icon: <Clock className="w-4 h-4" /> },
    { name: "Participants", href: "/participants", icon: <Users className="w-4 h-4" /> },
    { name: "Form Builder", href: "/form", icon: <FileText className="w-4 h-4" /> },
    { name: "Announcements", href: "/announcements", icon: <Megaphone className="w-4 h-4" /> },
    { name: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const handleReset = async () => {
    await signOutUser();
    resetEvent();
    router.push("/");
  };

  return (
    <div className={`h-screen w-screen flex flex-col md:flex-row bg-[#050505] text-[#f5f5f7] overflow-hidden font-sans ${isLightMode ? "light-theme" : ""}`}>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[250px] bg-[#080808] border-r border-white/5 flex-shrink-0 z-30 justify-between">
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-2.5 select-none group">
              {eventLogo ? (
                <img
                  src={eventLogo}
                  alt="Logo"
                  className="w-8 h-8 rounded-lg object-contain border border-white/10"
                />
              ) : (
                <div className="relative flex items-center justify-center w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-primary text-glow-primary"
                  >
                    <path d="M4 12h3l2-6 3 12 2-9 2 5h4" />
                  </svg>
                </div>
              )}
              <span className="text-white font-bold tracking-tight text-base group-hover:text-glow-primary transition-all">
                HackPulse
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all relative group ${
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-transparent text-white border-l-2 border-primary"
                      : "text-muted hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-primary text-glow-primary" : "text-muted group-hover:text-foreground"}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="p-4 border-t border-white/5 space-y-4 bg-black/25">
          {/* Connection Status */}
          <div className="flex items-center justify-between text-[10px] font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-success" /> CONNECTED
            </span>
            <span className="text-[9px] uppercase bg-success/10 text-success px-1.5 py-0.5 rounded font-bold">
              SYNC OK
            </span>
          </div>

          {/* Leave Room Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 font-mono text-[10px] font-bold tracking-wider px-3 py-2.5 border border-white/10 hover:border-danger bg-white/5 hover:bg-danger/10 rounded-xl text-muted hover:text-danger cursor-pointer transition-all uppercase select-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Room
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {eventLogo && (
              <img
                src={eventLogo}
                alt="Event Logo"
                className="w-6 h-6 rounded object-contain border border-white/10"
              />
            )}
            <h1 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[300px]">
              {eventName}
            </h1>
            <LiveBadge status={isCompleted ? "completed" : isRunning ? "live" : "upcoming"} size="sm" />
          </div>

          <div className="flex items-center gap-4">
            {/* Room code display */}
            <div className="hidden sm:block">
              <RoomCode code={roomCode} size="sm" />
            </div>

            {/* Stage mode Link shortcut */}
            <Link href={`/stage/${roomCode}`} target="_blank" title="Open stage view">
              <div className="flex items-center justify-center p-2 border border-white/5 hover:border-white/10 bg-white/5 rounded-lg text-muted hover:text-white transition-colors cursor-pointer">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Theme Toggler (Day Mode / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 border border-white/5 hover:border-white/10 bg-white/5 rounded-lg text-muted hover:text-white transition-colors cursor-pointer"
              title={isLightMode ? "Switch to Dark Mode" : "Switch to Day Mode"}
            >
              {isLightMode ? <Moon className="w-3.5 h-3.5 text-primary" /> : <Sun className="w-3.5 h-3.5 text-warning" />}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080808]/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-5 py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 text-[9px] font-mono uppercase tracking-tighter ${
                isActive ? "text-primary text-glow-primary" : "text-muted"
              }`}
            >
              {item.icon}
              <span>{item.name.substring(0, 8)}</span>
            </Link>
          );
        })}
      </nav>

      {/* RESET/EXIT CONFIRMATION MODAL */}
      <CustomModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Leave and Reset Event?"
        description="This will log you out, clear the current event state, and return you to the homepage. This action is permanent."
        confirmText="Reset Event"
        cancelText="Keep Room Open"
        variant="danger"
      />
    </div>
  );
}
