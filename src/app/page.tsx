"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Activity,
  Clock,
  Users,
  Megaphone,
  Monitor,
  Settings,
  Radio,
  Zap,
  ChevronRight,
  Copy,
  Plus,
  Play,
  Pause,
  MessageSquare,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  X,
  Upload,
  Image
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/context/event-context";
import { Navbar } from "@/components/navbar";
import { GlowButton } from "@/components/ui/glow-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { LiveBadge } from "@/components/ui/live-badge";
import { RoomCode } from "@/components/ui/room-code";
import { TimerDisplay } from "@/components/ui/timer-display";

export default function LandingPage() {
  const { createEvent, subscribeToRoom } = useEvent();
  const router = useRouter();

  const [heroTimer, setHeroTimer] = useState(31337); // Starts around 08:42:17
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Operator Launch Room states
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchName, setLaunchName] = useState("");
  const [launchLogo, setLaunchLogo] = useState("");
  const [launchCode, setLaunchCode] = useState("");
  const [launchLoading, setLaunchLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  // Automatically check if room exists when 5 digits are entered
  useEffect(() => {
    const checkRoomExists = async () => {
      if (launchCode.length === 5) {
        const codeUpper = launchCode.toUpperCase();
        try {
          const { db } = await import("@/lib/firebase");
          const { doc, getDoc } = await import("firebase/firestore");
          const roomRef = doc(db, "rooms", codeUpper);
          const snap = await getDoc(roomRef);
          
          if (snap.exists()) {
            setRoomExists(true);
            setLaunchName(snap.data().eventName || "");
            setLaunchLogo(snap.data().eventLogo || "");
            setShowNameInput(false);
          } else {
            setRoomExists(false);
            setShowNameInput(true);
            setLaunchName("");
            setLaunchLogo("");
          }
        } catch (err) {
          console.error("Error checking room:", err);
        }
      } else {
        setRoomExists(null);
        setShowNameInput(false);
      }
    };
    checkRoomExists();
  }, [launchCode]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setLaunchLogo(data.url);
      }
    } catch (err) {
      console.error("Failed to upload logo:", err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLaunchPanel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!launchCode.trim()) return;

    setLaunchLoading(true);
    try {
      const codeUpper = launchCode.toUpperCase();
      
      if (roomExists === true) {
        subscribeToRoom(codeUpper);
        if (typeof window !== "undefined") {
          localStorage.setItem("hackpulse-active-room", codeUpper);
        }
        router.push("/control");
        setShowLaunchModal(false);
        setShowNameInput(false);
        setLaunchName("");
        setLaunchLogo("");
        setLaunchCode("");
        setRoomExists(null);
      } else {
        if (!launchName.trim()) {
          setLaunchLoading(false);
          return;
        }

        await createEvent(launchName, [
          { name: "Opening Ceremony", duration: 30 },
          { name: "Hacking Phase", duration: 360 },
          { name: "Submissions", duration: 45 },
          { name: "Judging & Demos", duration: 60 },
          { name: "Closing Ceremony", duration: 30 }
        ], launchLogo);

        if (typeof window !== "undefined") {
          localStorage.setItem("hackpulse-active-room", codeUpper);
        }
        router.push("/control");
        setShowLaunchModal(false);
        setShowNameInput(false);
        setLaunchName("");
        setLaunchLogo("");
        setLaunchCode("");
        setRoomExists(null);
      }
    } catch (err) {
      console.error("Failed to launch panel:", err);
    } finally {
      setLaunchLoading(false);
    }
  };

  // Tick the hero countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroTimer((prev) => (prev > 0 ? prev - 1 : 31337));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parallax effect for the hero dashboard mockup
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Format helper for numbers
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Feature list
  const features = [
    {
      icon: <Radio className="w-6 h-6 text-primary" />,
      title: "LIVE CONTROL ROOM",
      desc: "Run every phase, adjust timings, and manage countdowns from one central mission control console.",
      visual: (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className="flex gap-2">
            <Pause className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white animate-pulse">PAUSED</span>
          </div>
          <span className="text-xl font-mono tracking-wider font-bold text-white text-glow-primary">02:14:09</span>
        </div>
      )
    },
    {
      icon: <Clock className="w-6 h-6 text-secondary" />,
      title: "SYNCED COUNTDOWN",
      desc: "Zero lag. Everyone—participants, mentors, judges, and projection screens—sees the exact same tick, everywhere.",
      visual: (
        <div className="flex items-center justify-around w-full h-full gap-2 px-4">
          {["Device A", "Device B", "Device C"].map((device, idx) => (
            <div key={idx} className="flex flex-col items-center p-2 bg-[#0c0c0e]/80 border border-white/5 rounded-xl flex-1 text-center scale-95 hover:scale-100 transition-all duration-300">
              <span className="text-[8px] text-muted tracking-widest uppercase">{device}</span>
              <span className="text-xs font-mono font-bold text-secondary text-glow-secondary mt-1">08:42:17</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: <Megaphone className="w-6 h-6 text-success" />,
      title: "LIVE ANNOUNCEMENTS",
      desc: "Broadcast critical updates instantly. Priority flags automatically push slide-in alert popups to all screens.",
      visual: (
        <div className="flex flex-col justify-center h-full w-full px-4 gap-2">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex items-center gap-2 p-2 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl"
          >
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-danger uppercase tracking-wider">Critical Update</p>
              <p className="text-[9px] text-white truncate">Submission portal closing in 10m!</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      icon: <Monitor className="w-6 h-6 text-white" />,
      title: "STAGE MODE",
      desc: "Turn any display or venue projector into your hackathon stage display with a high-fidelity visual UI.",
      visual: (
        <div className="w-full h-full bg-[#050505] rounded-xl border border-white/10 p-2 flex flex-col justify-between overflow-hidden relative group-hover:border-primary/40 transition-colors">
          <div className="flex justify-between items-center text-[7px] font-mono text-muted">
            <span>STAGE PROJECTOR</span>
            <LiveBadge status="live" showDotOnly />
          </div>
          <div className="text-center my-1 text-sm font-mono font-black tracking-widest text-white animate-pulse">
            08:42:17
          </div>
          <div className="flex justify-between text-[6px] font-mono text-[#0891b2]">
            <span>HACKING PHASE</span>
            <span>NEXT: SUBMISSION</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        </div>
      )
    },
    {
      icon: <Zap className="w-6 h-6 text-warning" />,
      title: "ROOM CODES",
      desc: "Provide participants with a single 6-digit access code to connect immediately. No registrations required.",
      visual: (
        <div className="flex items-center justify-center h-full">
          <RoomCode code="AI7X92" size="md" />
        </div>
      )
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "LIVE ACTIVITY",
      desc: "Know exactly what's happening. A real-time telemetry log tracks entries, phase changes, and submissions.",
      visual: (
        <div className="flex flex-col gap-1 w-full h-full justify-center px-4">
          {[
            { time: "18:42", desc: "Team Nova joined" },
            { time: "18:41", desc: "Announcement broadcasted" },
            { time: "18:39", desc: "Team Alpha submitted" }
          ].map((act, idx) => (
            <div key={idx} className="flex gap-2 text-[9px] font-mono border-b border-white/5 pb-1">
              <span className="text-primary font-bold">{act.time}</span>
              <span className="text-muted truncate">{act.desc}</span>
            </div>
          ))}
        </div>
      )
    }
  ];

  // Steps
  const steps = [
    {
      num: "01",
      title: "CREATE",
      desc: "Give your event a name and initiate a room code in seconds."
    },
    {
      num: "02",
      title: "CONFIGURE",
      desc: "Build your phases (Hacking, Submissions, Judging) and durations."
    },
    {
      num: "03",
      title: "SHARE",
      desc: "Broadcast your 6-digit Room Code to participants and projector displays."
    },
    {
      num: "04",
      title: "RUN",
      desc: "Control timers, pause clocks, and send live notifications in real-time."
    },
    {
      num: "05",
      title: "FINISH",
      desc: "Lock submissions, tally team scores, and display results seamlessly."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-[#050505]">
      {/* Global animated elements */}
      <div className="absolute inset-0 grid-bg-animated opacity-[0.12] z-0 pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] radial-glow opacity-[0.25] filter blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] secondary-glow opacity-[0.15] filter blur-[100px] z-0 pointer-events-none" />

      <Navbar />

      {/* HERO SECTION */}
      <section
        id="hero"
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 pt-32 pb-24 md:pt-40 md:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center cursor-default"
      >
        {/* Live indicator badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono font-medium tracking-wide text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
            <span className="text-[#ef4444] font-bold">●</span>
            LIVE HACKATHON CONTROL ROOM ACTIVE
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white max-w-4xl leading-[1.05]"
        >
          Your hackathon.
          <br />
          <span className="bg-gradient-to-r from-primary via-[#a78bfa] to-secondary bg-clip-text text-transparent">
            In perfect sync.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted max-w-2xl font-normal leading-relaxed"
        >
          One control room for phases, countdowns, announcements, participants, and live stage displays.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
        >
          <div className="w-full sm:w-auto">
            <GlowButton
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold"
              onClick={() => setShowLaunchModal(true)}
            >
              Launch Control Room <ArrowRight className="w-4 h-4 ml-1" />
            </GlowButton>
          </div>
          <Link href="/join" className="w-full sm:w-auto">
            <GlowButton variant="outline" size="lg" className="w-full sm:w-auto font-bold border-white/10 hover:border-white/20">
              Join an Event
            </GlowButton>
          </Link>
        </motion.div>

        {/* Sub-label bullet points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-6 flex gap-6 text-xs font-mono text-muted uppercase tracking-wider"
        >
          <span>No credit card required</span>
          <span>•</span>
          <span>Free to run</span>
          <span>•</span>
          <span>Real-time sync</span>
        </motion.div>

        {/* Floating Mockup Dashboard Panel */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{
            transformStyle: "preserve-3d",
            rotateX: mousePosition.y * -15, // tilt range
            rotateY: mousePosition.x * 15,
          }}
          className="mt-20 w-full max-w-5xl relative z-10 select-none group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl filter blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          
          <GlassPanel className="p-0 border border-white/10 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Mock Header */}
            <div className="px-6 py-4 bg-[#080808]/90 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
                <span className="font-mono text-xs font-bold text-white tracking-widest">LIVE</span>
                <span className="h-4 w-px bg-white/10" />
                <span className="font-sans text-xs text-muted font-semibold">AI INNOVATION HACKATHON</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0c0c0e] border border-white/5 rounded-lg">
                  <span className="text-[10px] font-mono text-muted">ROOM</span>
                  <span className="text-[10px] font-mono font-bold text-[#0891b2]">AI7X92</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-success" />
              </div>
            </div>

            {/* Mock Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5 bg-[#0c0c0e]/30">
              {/* Left Column: Phases */}
              <div className="p-6 flex flex-col gap-4 text-left">
                <h4 className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase">EVENT TIMELINE</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { name: "Opening Ceremony", time: "09:00 - 09:30", status: "completed" },
                    { name: "Hacking Phase", time: "09:30 - 19:30", status: "live" },
                    { name: "Submissions", time: "19:30 - 20:15", status: "upcoming" },
                  ].map((phase, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        phase.status === "live"
                          ? "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.05)]"
                          : "bg-transparent border-white/5 opacity-55"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white">{phase.name}</span>
                        {phase.status === "live" && <LiveBadge status="live" size="sm" />}
                      </div>
                      <span className="text-[10px] font-mono text-muted">{phase.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Column: Timer & Progress */}
              <div className="p-8 flex flex-col items-center justify-center text-center gap-6">
                <span className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase">HACKING COUNTDOWN</span>
                
                {/* Big Timer */}
                <div className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tracking-tight text-white font-black my-2 text-glow-primary select-all">
                  {formatTimer(heroTimer)}
                </div>

                <div className="w-full flex flex-col gap-2 mt-2">
                  <div className="flex justify-between text-[10px] font-mono text-muted">
                    <span>127 PARTICIPANTS ONLINE</span>
                    <span className="text-primary font-bold">82% PHASE COMPLETE</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      animate={{ width: "82%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  </div>
                </div>

                <div className="flex justify-between w-full border-t border-white/5 pt-4 text-left">
                  <div>
                    <p className="text-[9px] font-mono text-muted">NEXT PHASE</p>
                    <p className="text-xs font-bold text-white uppercase mt-0.5">SUBMISSION</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-muted">STARTS AT</p>
                    <p className="text-xs font-mono font-bold text-[#0891b2] mt-0.5">19:30 (18:00 remaining)</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Activity Log */}
              <div className="p-6 flex flex-col gap-4 text-left">
                <h4 className="text-[10px] font-mono font-bold tracking-widest text-muted uppercase">LIVE ACTIVITY TELEMETRY</h4>
                <div className="flex flex-col gap-3 font-mono">
                  {[
                    { type: "join", time: "18:42:15", text: "Team Nova joined the room" },
                    { type: "ann", time: "18:41:09", text: "Announcement broadcasted to screens" },
                    { type: "sub", time: "18:39:44", text: "Team Alpha uploaded draft submission" },
                    { type: "time", time: "18:36:20", text: "Phase timer extended +15 min by admin" },
                  ].map((act, idx) => (
                    <div key={idx} className="text-xs flex gap-2.5 pb-2.5 border-b border-white/5 last:border-0 last:pb-0 items-start">
                      <span className="text-primary text-[10px] font-bold mt-0.5">{act.time}</span>
                      <div className="flex-1">
                        <span className="text-white text-[11px] block">{act.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </section>

      {/* TRUST / SOCIAL SECTION */}
      <section className="relative z-10 py-16 border-t border-b border-white/5 bg-[#080808]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono font-bold tracking-widest text-muted uppercase mb-10">
            BUILT FOR FAST-MOVING EVENTS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "TEAMS REGISTERED", val: "48" },
              { label: "PARTICIPANTS ONLINE", val: "127" },
              { label: "COUNTDOWN ACCURACY", val: "12h" },
              { label: "CONTROL CENTER", val: "01" }
            ].map((stat, idx) => (
              <GlassPanel key={idx} className="p-6 bg-white/5 border-white/5 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-mono font-black text-white text-glow-primary mb-1">
                  {stat.val}
                </span>
                <span className="text-[9px] font-mono tracking-widest text-muted uppercase text-center mt-1">
                  {stat.label}
                </span>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Everything happens here.
          </h2>
          <p className="text-muted text-base sm:text-lg mt-4">
            From the first minute to the final result, sync everyone under one central clock.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="flex flex-col h-full rounded-3xl border border-white/10 bg-[#0c0c0e]/40 p-6 relative overflow-hidden transition-colors hover:border-primary/30 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold tracking-wider font-mono text-white group-hover:text-glow-primary transition-all">
                  {feat.title}
                </h3>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-6">
                {feat.desc}
              </p>
              
              {/* Feature Internal Visual */}
              <div className="mt-auto h-28 w-full bg-black/40 rounded-2xl border border-white/5 p-4 flex items-center justify-center overflow-hidden relative">
                {feat.visual}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]/40" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative z-10 py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How HackPulse Works
          </h2>
          <p className="text-muted text-sm mt-3">
            Deploy your hackathon command center in five simple phases.
          </p>
        </div>

        {/* Elegant Timeline */}
        <div className="relative">
          {/* Vertical glowing path line */}
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-success opacity-40" />

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-start gap-8 relative z-10 group"
              >
                {/* Number bullet */}
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#0c0c0e] border border-white/10 group-hover:border-primary/40 flex items-center justify-center font-mono font-bold text-sm text-glow-primary text-primary transition-all">
                  {step.num}
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-bold text-white font-mono tracking-wider group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted mt-1 leading-relaxed max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRODUCT SHOWCASE */}
      <section id="product" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            One screen. Total control.
          </h2>
          <p className="text-muted text-sm sm:text-base mt-4">
            Manage announcements, timeline, telemetry logs, and countdowns in real-time.
          </p>
        </div>

        {/* Detailed mockup grid */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0c0c0e]/30 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 grid-bg opacity-[0.05]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            {/* Sidebar Mock */}
            <div className="p-6 bg-[#080808]/80 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">H</div>
                <span className="text-xs font-bold text-white">HackPulse OS</span>
              </div>
              <div className="space-y-2">
                {["Overview", "Timeline", "Participants", "Announcements", "Settings"].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                      idx === 0
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Mock */}
            <div className="p-8 lg:col-span-3 space-y-6 bg-[#0c0c0e]/20">
              {/* Telemetry rows */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: "Participants", value: "127", desc: "+3 in last 5m" },
                  { title: "Announcements", value: "8", desc: "2 Critical" },
                  { title: "Sync Quality", value: "99.8%", desc: "Avg delay 4ms" }
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="text-[10px] font-mono tracking-wider text-muted block uppercase">{stat.title}</span>
                    <span className="text-xl font-bold font-mono text-white mt-1 block">{stat.value}</span>
                    <span className="text-[9px] text-[#0891b2] font-mono mt-0.5 block">{stat.desc}</span>
                  </div>
                ))}
              </div>

              {/* Center Panel */}
              <div className="p-6 bg-[#080808]/60 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[8px] font-mono text-muted">
                  <span>ROOM STATE:</span>
                  <span className="text-success font-bold">RUNNING</span>
                </div>
                <span className="text-xs font-mono text-muted uppercase tracking-widest">SUBMISSION DEADLINE</span>
                <span className="text-4xl font-mono font-black text-white text-glow-primary my-3">01:42:17</span>
                <span className="text-[10px] text-[#ef4444] font-mono tracking-widest uppercase bg-danger/10 border border-danger/20 px-3 py-1 rounded-full animate-pulse">
                  5 MINUTES REMAINING
                </span>
              </div>
            </div>
          </div>

          {/* Floating UI Badges */}
          <div className="absolute top-12 left-1/4 animate-bounce duration-1000 p-2.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-xl text-[10px] font-bold text-white shadow-lg pointer-events-none">
            🚀 12 Teams Submitted
          </div>
          <div className="absolute bottom-12 right-1/4 animate-bounce duration-[1500ms] p-2.5 bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-xl text-[10px] font-bold text-white shadow-lg pointer-events-none">
            📢 Phase changed to Submission
          </div>
        </div>
      </section>

      {/* STAGE MODE SHOWCASE (Visually Dramatic) */}
      <section id="stage-showcase" className="relative z-10 py-28 bg-black border-t border-b border-white/10 flex flex-col items-center text-center">
        {/* Subtle grid lines & scanlines */}
        <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#0891b2] text-glow-secondary uppercase">
              PROJECTOR OVERLAY MODE
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mt-4 leading-tight">
              Turn any screen
              <br />
              into your stage.
            </h2>
          </div>

          {/* Stage Preview Dashboard Container */}
          <div className="border border-white/20 bg-black rounded-3xl p-8 relative overflow-hidden max-w-3xl mx-auto shadow-[0_0_80px_rgba(124,58,237,0.15)] group hover:border-primary/30 transition-all duration-500">
            {/* Scanlines layer */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none" />
            <div className="scanline-bar" />

            <div className="flex justify-between items-center text-[10px] font-mono text-muted mb-8">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                STAGE MODE ACTIVE
              </span>
              <span className="font-bold text-white tracking-widest uppercase">AI INNOVATION HACKATHON</span>
              <span className="text-[#0891b2]">ROOM: AI7X92</span>
            </div>

            <div className="my-8">
              <p className="text-xs font-mono text-[#0891b2] tracking-widest uppercase">HACKING TIMELINE</p>
              <h3 className="text-5xl sm:text-7xl font-mono font-black text-white tracking-tight my-4 tabular-nums text-glow-primary">
                08:42:17
              </h3>
            </div>

            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-6">
              <div className="w-[82%] h-full bg-primary" />
            </div>

            <div className="flex justify-between text-left text-xs font-mono border-t border-white/10 pt-4 text-muted">
              <div>
                <span className="block text-[9px] text-muted">CURRENT</span>
                <span className="font-bold text-white uppercase">HACKING</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] text-muted">NEXT</span>
                <span className="font-bold text-[#0891b2] uppercase">SUBMISSION — 18:00</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/stage/AI7X92">
              <GlowButton variant="outline" size="md" className="border-white/10 hover:border-white/20 font-mono text-xs">
                Launch Stage Mode fullscreen
              </GlowButton>
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative z-10 py-32 flex flex-col items-center text-center">
        {/* Glowing background bubble */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] radial-glow opacity-30 filter blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Ready to run
            <br />
            the room?
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Your next hackathon deserves more than a countdown timer. Run it like a mission control room.
          </p>
          <div className="flex justify-center gap-4">
            <GlowButton
              variant="primary"
              size="lg"
              className="px-10 font-bold"
              onClick={() => setShowLaunchModal(true)}
            >
              Launch HackPulse <ArrowRight className="w-4 h-4 ml-1.5" />
            </GlowButton>
          </div>
        </div>
      </section>

      {/* Launch Control Modal */}
      <AnimatePresence>
        {showLaunchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowLaunchModal(false);
                setShowNameInput(false);
                setLaunchName("");
                setLaunchLogo("");
                setLaunchCode("");
              }}
              className="absolute inset-0 bg-[#020202]/85 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#080808]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10"
            >
              <button
                onClick={() => {
                  setShowLaunchModal(false);
                  setShowNameInput(false);
                  setLaunchName("");
                  setLaunchLogo("");
                  setLaunchCode("");
                  setRoomExists(null);
                }}
                className="absolute top-4 right-4 text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">OPERATOR CONSOLE</span>
                <h3 className="text-xl font-black text-white font-mono tracking-tight uppercase mt-0.5">LAUNCH PANEL</h3>
                <p className="text-xs text-muted mt-2 leading-relaxed uppercase">
                  {roomExists === false 
                    ? "Complete details below to initialize and launch your event control room." 
                    : "Enter your 5-digit Room Code to open your event control room."}
                </p>
              </div>
              
              <form onSubmit={handleLaunchPanel} className="space-y-4">
                <div>
                  <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block mb-1.5">5-Digit Room Code</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={launchCode}
                    onChange={(e) => setLaunchCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-glow-secondary text-[#0891b2] font-mono font-black tracking-widest uppercase focus:outline-none focus:border-secondary"
                    placeholder="e.g. AI7X9"
                    disabled={launchLoading}
                  />
                  {roomExists === true && (
                    <div className="text-[10px] font-mono text-[#10b981] uppercase mt-2 flex items-center gap-1 font-bold">
                      <span>✓ Found Event: {launchName}</span>
                    </div>
                  )}
                  {roomExists === false && (
                    <div className="text-[10px] font-mono text-[#f59e0b] uppercase mt-2 flex items-center gap-1 font-bold">
                      <span>+ New Room detected</span>
                    </div>
                  )}
                </div>

                {showNameInput && (
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    {/* Event Name */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block">Event / Panel Name</label>
                      <input
                        type="text"
                        required
                        value={launchName}
                        onChange={(e) => setLaunchName(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary font-sans"
                        placeholder="e.g. HackPulse Summit"
                        disabled={launchLoading}
                      />
                    </div>

                    {/* Event Logo */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block">Event Logo Image</label>
                      <div className="flex gap-3 items-center">
                        {launchLogo ? (
                          <div className="w-12 h-12 rounded-xl border border-white/10 bg-[#050505] p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={launchLogo} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-white/5 bg-[#050505] flex items-center justify-center flex-shrink-0 text-muted">
                            <Image className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <input
                            type="file"
                            id="launch-logo-file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            disabled={launchLoading || uploadingLogo}
                          />
                          <label
                            htmlFor="launch-logo-file"
                            className="inline-flex items-center justify-center font-mono text-[9px] font-bold tracking-wider px-3 py-2 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-white hover:bg-white/10 cursor-pointer transition-all uppercase select-none gap-1"
                          >
                            <Upload className="w-3 h-3 text-primary" />
                            {uploadingLogo ? "Uploading..." : "Upload logo file"}
                          </label>
                          {launchLogo && (
                            <button
                              type="button"
                              onClick={() => setLaunchLogo("")}
                              className="text-[9px] font-mono font-bold text-danger hover:underline cursor-pointer uppercase ml-3"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <GlowButton
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full font-bold uppercase tracking-wider font-mono text-xs py-3"
                    disabled={launchLoading}
                  >
                    {launchLoading 
                      ? "Processing..." 
                      : roomExists === false 
                      ? "LAUNCH THE HACK" 
                      : "Access Operator Room"}
                  </GlowButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="relative z-10 mt-auto border-t border-white/5 bg-[#050505] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-primary"
              >
                <path d="M4 12h3l2-6 3 12 2-9 2 5h4" />
              </svg>
              <span className="font-bold text-white text-sm tracking-tight">HackPulse</span>
            </div>
            <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
              One Pulse. One Hackathon. Everyone in Sync.
            </p>
          </div>

          <div className="flex gap-8 text-xs font-medium text-muted">
            <Link href="#product" className="hover:text-white transition-colors">Product</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/stage/AI7X92" className="hover:text-white transition-colors">Stage Mode</Link>
            <Link href="/join" className="hover:text-white transition-colors">Documentation</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>

          <p className="text-[10px] text-muted font-mono">
            &copy; {new Date().getFullYear()} HackPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
