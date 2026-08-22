"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import {
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";

export interface Phase {
  id: string;
  name: string;
  durationMinutes: number;
  status: "completed" | "live" | "upcoming";
  startTime: string;
  endTime: string;
}

export interface Announcement {
  id: string;
  content: string;
  timestamp: string;
  priority: "normal" | "important" | "critical";
}

export interface Participant {
  id: string;
  name: string;
  team: string;
  teamNumber?: string;
  teamSize?: number;
  status: "online" | "offline";
  joined: string;
  lastSeen: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  description: string;
  type: "join" | "announcement" | "timer" | "phase" | "submit" | "system";
}

export interface FormQuestion {
  id: string;
  text: string;
  type: "text" | "progress";
}

export interface FormSubmission {
  id: string;
  teamName: string;
  teamNumber: string;
  projectName: string;
  progressPercent: number;
  answers: Record<string, string>; // questionId -> answer
  timestamp: string;
}

export interface FormConfig {
  isActive: boolean;
  questions: FormQuestion[];
}

interface EventState {
  eventName: string;
  eventLogo: string;
  roomCode: string;
  phases: Phase[];
  announcements: Announcement[];
  participants: Participant[];
  activities: Activity[];
  submissions: FormSubmission[];
  formConfig: FormConfig;
  activePhaseIndex: number;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isCompleted: boolean;
  user: User | null;
  authLoading: boolean;
}

interface EventContextProps extends EventState {
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  subscribeToRoom: (code: string) => () => void;
  createEvent: (name: string, phases: { name: string; duration: number }[], logoUrl?: string, forcedCode?: string) => Promise<string>;
  updateSettings: (name: string, code: string, logoUrl?: string) => Promise<void>;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  addTime: (minutes: number) => Promise<void>;
  nextPhase: () => Promise<void>;
  prevPhase: () => Promise<void>;
  addAnnouncement: (content: string, priority: "normal" | "important" | "critical") => Promise<void>;
  joinEvent: (roomCode: string, name: string) => Promise<boolean>;
  addParticipant: (name: string, team: string, teamNumber?: string, teamSize?: number) => Promise<void>;
  deleteParticipant: (participantId: string) => Promise<void>;
  updatePhase: (phaseId: string, name: string, durationMinutes: number) => Promise<void>;
  deletePhase: (phaseId: string) => Promise<void>;
  endEvent: () => Promise<void>;
  resetEvent: () => void;
  updateFormConfig: (isActive: boolean, questions: FormQuestion[]) => Promise<void>;
  submitFormResponse: (teamName: string, teamNumber: string, projectName: string, progressPercent: number, answers: Record<string, string>) => Promise<void>;
  deleteSubmission: (submissionId: string) => Promise<void>;
}

const DEFAULT_PHASES: Phase[] = [
  { id: "1", name: "OPENING", durationMinutes: 30, status: "completed", startTime: "09:00", endTime: "09:30" },
  { id: "2", name: "HACKING", durationMinutes: 600, status: "live", startTime: "09:30", endTime: "19:30" },
  { id: "3", name: "SUBMISSION", durationMinutes: 45, status: "upcoming", startTime: "19:30", endTime: "20:15" },
  { id: "4", name: "JUDGING", durationMinutes: 90, status: "upcoming", startTime: "20:15", endTime: "21:45" },
  { id: "5", name: "RESULTS", durationMinutes: 30, status: "upcoming", startTime: "21:45", endTime: "22:15" },
];

const EventContext = createContext<EventContextProps | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [eventName, setEventName] = useState("AI Innovation Hackathon");
  const [eventLogo, setEventLogo] = useState("");
  const [roomCode, setRoomCode] = useState("AI7X9");
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [formConfig, setFormConfig] = useState<FormConfig>({ isActive: false, questions: [] });
  const [activePhaseIndex, setActivePhaseIndex] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(18000 + 42 * 60 + 17);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeRoomRef = useRef<string>("AI7X9");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    // Pick up result if user was redirected back from Google
    getRedirectResult(auth).catch(() => {/* no redirect pending */});
    return unsubscribe;
  }, []);

  const getFormattedTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // Google Authentication actions
  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      console.error("Google sign in failed", e);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  // Subscribe to Firestore for a specific Room
  const subscribeToRoom = useCallback((code: string) => {
    const upperCode = code.toUpperCase();
    setRoomCode(upperCode);
    activeRoomRef.current = upperCode;
    if (typeof window !== "undefined") {
      localStorage.setItem("hackpulse-active-room", upperCode);
    }

    // 1. Subscribe to Room document
    const roomRef = doc(db, "rooms", upperCode);
    const unsubRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setEventName(data.eventName || "Hackathon Event");
        setEventLogo(data.eventLogo || "");
        setPhases(data.phases || DEFAULT_PHASES);
        setActivePhaseIndex(data.activePhaseIndex ?? 0);
        setIsRunning((prevRunning) => {
          if (prevRunning !== (data.isRunning ?? false)) return data.isRunning ?? false;
          return prevRunning;
        });
        setIsCompleted((prevCompleted) => {
          if (prevCompleted !== (data.isCompleted ?? false)) return data.isCompleted ?? false;
          return prevCompleted;
        });
        setTimeRemaining((prevTime) => {
          const dbTime = data.timeRemaining ?? 0;
          if (Math.abs(prevTime - dbTime) > 3 || dbTime === 0) {
            return dbTime;
          }
          return prevTime;
        });
        if (data.formConfig) {
          setFormConfig({
            isActive: data.formConfig.isActive ?? false,
            questions: Array.isArray(data.formConfig.questions) ? data.formConfig.questions : [],
          });
        }
      }
    });

    // 2. Subscribe to Announcements subcollection
    const annRef = collection(db, "rooms", upperCode, "announcements");
    const annQuery = query(annRef, orderBy("timestamp", "desc"));
    const unsubAnn = onSnapshot(annQuery, (snapshot) => {
      const items: Announcement[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          content: d.content || "",
          timestamp: d.timestamp || "",
          priority: d.priority || "normal",
        });
      });
      setAnnouncements(items);
    });

    // 3. Subscribe to Participants subcollection
    const partRef = collection(db, "rooms", upperCode, "participants");
    const unsubPart = onSnapshot(partRef, (snapshot) => {
      const items: Participant[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name || "",
          team: d.team || "",
          teamNumber: d.teamNumber || "N/A",
          teamSize: d.teamSize ? Number(d.teamSize) : 1,
          status: d.status || "offline",
          joined: d.joined || "",
          lastSeen: d.lastSeen || "",
        });
      });
      setParticipants(items);
    });

    // 4. Subscribe to Activities subcollection
    const actRef = collection(db, "rooms", upperCode, "activities");
    const actQuery = query(actRef, orderBy("timestamp", "desc"));
    const unsubAct = onSnapshot(actQuery, (snapshot) => {
      const items: Activity[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          timestamp: d.timestamp || "",
          description: d.description || "",
          type: d.type || "system",
        });
      });
      setActivities(items);
    });

    // 5. Subscribe to Submissions subcollection
    const subRef = collection(db, "rooms", upperCode, "submissions");
    const subQuery = query(subRef, orderBy("timestamp", "desc"));
    const unsubSub = onSnapshot(subQuery, (snapshot) => {
      const items: FormSubmission[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          teamName: d.teamName || "",
          teamNumber: d.teamNumber || "",
          projectName: d.projectName || "",
          progressPercent: d.progressPercent || 0,
          answers: d.answers || {},
          timestamp: d.timestamp || "",
        });
      });
      setSubmissions(items);
    });

    return () => {
      unsubRoom();
      unsubAnn();
      unsubPart();
      unsubAct();
      unsubSub();
    };
  }, []);

  // Local effect: Subscribe to default room on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("hackpulse-active-room") : null;
    const unsub = subscribeToRoom(saved || "AI7X9");
    return unsub;
  }, []);

  // 1. Local Countdown Ticking Effect (runs smoothly on all screens)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeRemaining > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isCompleted]);

  // Safe update helper to avoid crashes if document does not exist
  const safeUpdateDoc = async (docRef: any, data: any) => {
    try {
      await updateDoc(docRef, data);
    } catch (err) {
      console.warn("safeUpdateDoc failed (document might not exist):", err);
    }
  };

  // 2. Periodic Database Sync from Operator Screen (syncs every 5s or at transition)
  useEffect(() => {
    const isOperatorPage = typeof window !== "undefined" && window.location.pathname === "/control";
    
    if (isRunning && timeRemaining > 0 && !isCompleted && isOperatorPage) {
      let syncCounter = 0;
      intervalRef.current = setInterval(async () => {
        syncCounter++;
        const roomRef = doc(db, "rooms", activeRoomRef.current);
        
        // Write time back to database at 0 or every 5 seconds
        if (timeRemaining - 1 <= 0) {
          clearInterval(intervalRef.current!);
          const nextIdx = activePhaseIndex + 1;
          if (nextIdx < phases.length) {
            const updatedPhases = phases.map((p, idx) => {
              if (idx === activePhaseIndex) return { ...p, status: "completed" as const };
              if (idx === nextIdx) return { ...p, status: "live" as const };
              return p;
            });
            const nextPhaseObj = phases[nextIdx];
            await safeUpdateDoc(roomRef, {
              activePhaseIndex: nextIdx,
              phases: updatedPhases,
              timeRemaining: nextPhaseObj.durationMinutes * 60,
            });

            await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
              timestamp: getFormattedTime(),
              description: `Phase auto-changed to ${nextPhaseObj.name}.`,
              type: "phase",
            });
          } else {
            await safeUpdateDoc(roomRef, {
              timeRemaining: 0,
              isRunning: false,
              isCompleted: true,
            });
          }
        } else if (syncCounter >= 5) {
          syncCounter = 0;
          await safeUpdateDoc(roomRef, {
            timeRemaining: timeRemaining - 1
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, activePhaseIndex, phases, isCompleted]);

  const createEvent = async (name: string, customPhases: { name: string; duration: number }[], logoUrl?: string, forcedCode?: string): Promise<string> => {
    let code = forcedCode ? forcedCode.toUpperCase() : "";
    if (!code) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    let currentTime = new Date();
    currentTime.setMinutes(0);
    currentTime.setSeconds(0);

    const generatedPhases: Phase[] = customPhases.map((p, idx) => {
      const startStr = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;
      currentTime.setMinutes(currentTime.getMinutes() + p.duration);
      const endStr = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;
      return {
        id: `p_${idx + 1}`,
        name: p.name.toUpperCase(),
        durationMinutes: p.duration,
        status: idx === 0 ? ("live" as const) : ("upcoming" as const),
        startTime: startStr,
        endTime: endStr,
      };
    });

    const roomRef = doc(db, "rooms", code);
    await setDoc(roomRef, {
      eventName: name,
      eventLogo: logoUrl || "",
      roomCode: code,
      phases: generatedPhases,
      activePhaseIndex: 0,
      timeRemaining: generatedPhases[0] ? generatedPhases[0].durationMinutes * 60 : 0,
      isRunning: false,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });

    // Seed initial collections
    await addDoc(collection(db, "rooms", code, "announcements"), {
      content: `Welcome to ${name}! Event Room Code: ${code}`,
      timestamp: getFormattedTime(),
      priority: "important",
    });

    await addDoc(collection(db, "rooms", code, "activities"), {
      timestamp: getFormattedTime(),
      description: `New hackathon "${name}" initialized. Room code: ${code}`,
      type: "system",
    });

    // Update locally too
    subscribeToRoom(code);
    return code;
  };

  const updateSettings = async (name: string, code: string, logoUrl?: string) => {
    const upper = code.toUpperCase();
    const roomRef = doc(db, "rooms", activeRoomRef.current);
    
    await safeUpdateDoc(roomRef, {
      eventName: name,
      roomCode: upper,
      eventLogo: logoUrl || "",
    });

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp: getFormattedTime(),
      description: `Event settings modified. Code: ${upper}`,
      type: "system",
    });
  };

  const startTimer = async () => {
    const roomRef = doc(db, "rooms", activeRoomRef.current);
    await safeUpdateDoc(roomRef, { isRunning: true });

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp: getFormattedTime(),
      description: "Timer control: Resumed countdown.",
      type: "timer",
    });
  };

  const pauseTimer = async () => {
    const roomRef = doc(db, "rooms", activeRoomRef.current);
    await safeUpdateDoc(roomRef, { isRunning: false });

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp: getFormattedTime(),
      description: "Timer control: Paused countdown.",
      type: "timer",
    });
  };

  const addTime = async (minutes: number) => {
    const roomRef = doc(db, "rooms", activeRoomRef.current);
    const newTime = timeRemaining + minutes * 60;

    const updatedPhases = phases.map((p, idx) => {
      if (idx === activePhaseIndex) {
        const [hours, mins] = p.endTime.split(":").map(Number);
        const end = new Date();
        end.setHours(hours);
        end.setMinutes(mins + minutes);
        const endStr = `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
        return {
          ...p,
          durationMinutes: p.durationMinutes + minutes,
          endTime: endStr,
        };
      }
      return p;
    });

    await safeUpdateDoc(roomRef, {
      timeRemaining: newTime,
      phases: updatedPhases,
    });

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp: getFormattedTime(),
      description: `Extended timer by ${minutes} minutes.`,
      type: "timer",
    });
  };

  const nextPhase = async () => {
    const nextIdx = activePhaseIndex + 1;
    if (nextIdx < phases.length) {
      const roomRef = doc(db, "rooms", activeRoomRef.current);
      const updatedPhases = phases.map((p, idx) => {
        if (idx === activePhaseIndex) return { ...p, status: "completed" as const };
        if (idx === nextIdx) return { ...p, status: "live" as const };
        return p;
      });

      await safeUpdateDoc(roomRef, {
        activePhaseIndex: nextIdx,
        phases: updatedPhases,
        timeRemaining: phases[nextIdx].durationMinutes * 60,
      });

      await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
        timestamp: getFormattedTime(),
        description: `Advanced timeline to phase: ${phases[nextIdx].name}`,
        type: "phase",
      });
    }
  };

  const prevPhase = async () => {
    const prevIdx = activePhaseIndex - 1;
    if (prevIdx >= 0) {
      const roomRef = doc(db, "rooms", activeRoomRef.current);
      const updatedPhases = phases.map((p, idx) => {
        if (idx === activePhaseIndex) return { ...p, status: "upcoming" as const };
        if (idx === prevIdx) return { ...p, status: "live" as const };
        return p;
      });

      await safeUpdateDoc(roomRef, {
        activePhaseIndex: prevIdx,
        phases: updatedPhases,
        timeRemaining: phases[prevIdx].durationMinutes * 60,
      });

      await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
        timestamp: getFormattedTime(),
        description: `Reverted timeline to phase: ${phases[prevIdx].name}`,
        type: "phase",
      });
    }
  };

  const addAnnouncement = async (content: string, priority: "normal" | "important" | "critical") => {
    const annRef = collection(db, "rooms", activeRoomRef.current, "announcements");
    await addDoc(annRef, {
      content,
      timestamp: getFormattedTime(),
      priority,
    });

    const actRef = collection(db, "rooms", activeRoomRef.current, "activities");
    await addDoc(actRef, {
      timestamp: getFormattedTime(),
      description: `Broadcasted alert: "${content.substring(0, 30)}..."`,
      type: "announcement",
    });
  };

  const joinEvent = async (code: string, name: string): Promise<boolean> => {
    const upperCode = code.toUpperCase();
    
    // Check if room exists in Firestore
    const roomRef = doc(db, "rooms", upperCode);
    const snap = await getDocs(query(collection(db, "rooms")));
    let exists = false;
    snap.forEach((doc) => {
      if (doc.id === upperCode) exists = true;
    });

    if (!exists) {
      return false;
    }

    subscribeToRoom(upperCode);
    await addParticipant(name, "Solo Hacker");
    return true;
  };

  const addParticipant = async (name: string, team: string, teamNumber?: string, teamSize?: number) => {
    const partRef = collection(db, "rooms", activeRoomRef.current, "participants");
    const time = getFormattedTime();

    await addDoc(partRef, {
      name,
      team: team || "Hacker Team",
      teamNumber: teamNumber || "N/A",
      teamSize: teamSize ? Number(teamSize) : 1,
      status: "online",
      joined: time,
      lastSeen: time,
    });

    const actRef = collection(db, "rooms", activeRoomRef.current, "activities");
    await addDoc(actRef, {
      timestamp: time,
      description: `${name} (${team || "Individual"}) joined the event room.`,
      type: "join",
    });
  };

  const updatePhase = async (phaseId: string, name: string, durationMinutes: number) => {
    const roomRef = doc(db, "rooms", activeRoomRef.current);
    
    const updatedPhases = phases.map((p) => {
      if (p.id === phaseId) {
        return {
          ...p,
          name: name.toUpperCase(),
          durationMinutes: Number(durationMinutes),
        };
      }
      return p;
    });

    // If we're updating the currently active phase, we should recalculate the timeRemaining if the timer isn't running or has changed.
    // However, to keep it simple, we'll write the updated duration and optionally set the timeRemaining.
    const isCurrentActive = phases[activePhaseIndex]?.id === phaseId;

    if (isCurrentActive) {
      await safeUpdateDoc(roomRef, {
        phases: updatedPhases,
        timeRemaining: Number(durationMinutes) * 60,
      });
    } else {
      await safeUpdateDoc(roomRef, {
        phases: updatedPhases,
      });
    }

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp: getFormattedTime(),
      description: `Phase "${name.toUpperCase()}" updated to ${durationMinutes} minutes.`,
      type: "system",
    });
  };

  const deletePhase = async (phaseId: string) => {
    if (phases.length <= 1) return; // Must keep at least one phase

    const roomRef = doc(db, "rooms", activeRoomRef.current);
    const phaseToDelete = phases.find((p) => p.id === phaseId);
    const phaseName = phaseToDelete?.name || "Unknown";

    const updatedPhases = phases.filter((p) => p.id !== phaseId);

    // Re-constrain active phase index
    let nextActiveIndex = activePhaseIndex;
    if (nextActiveIndex >= updatedPhases.length) {
      nextActiveIndex = Math.max(0, updatedPhases.length - 1);
    }

    // Set timeRemaining if active index is changed or updated
    const nextActivePhase = updatedPhases[nextActiveIndex];

    await safeUpdateDoc(roomRef, {
      phases: updatedPhases,
      activePhaseIndex: nextActiveIndex,
      timeRemaining: nextActivePhase ? nextActivePhase.durationMinutes * 60 : 0,
    });

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp: getFormattedTime(),
      description: `Phase "${phaseName}" deleted from timeline.`,
      type: "system",
    });
  };

  const endEvent = async () => {
    const roomRef = doc(db, "rooms", activeRoomRef.current);
    const finishedPhases = phases.map((p) => ({ ...p, status: "completed" as const }));

    await safeUpdateDoc(roomRef, {
      phases: finishedPhases,
      timeRemaining: 0,
      isRunning: false,
      isCompleted: true,
    });

    const actRef = collection(db, "rooms", activeRoomRef.current, "activities");
    await addDoc(actRef, {
      timestamp: getFormattedTime(),
      description: "Hackathon closed. Operator terminated countdown timer.",
      type: "system",
    });
  };

  const deleteParticipant = async (participantId: string) => {
    try {
      const partDocRef = doc(db, "rooms", activeRoomRef.current, "participants", participantId);
      await deleteDoc(partDocRef);
    } catch (err) {
      console.error("Failed to delete participant:", err);
    }
  };

  const updateFormConfig = async (isActive: boolean, questions: FormQuestion[]) => {
    const roomRef = doc(db, "rooms", activeRoomRef.current);
    // Use setDoc+merge so this works even if the room doc has no formConfig yet
    await setDoc(roomRef, {
      formConfig: {
        isActive,
        questions,
      }
    }, { merge: true });

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp: getFormattedTime(),
      description: `Submission Form was updated (Status: ${isActive ? "OPEN" : "STOPPED"}, ${questions.length} question(s)).`,
      type: "system",
    });
  };

  const submitFormResponse = async (
    teamName: string,
    teamNumber: string,
    projectName: string,
    progressPercent: number,
    answers: Record<string, string>
  ) => {
    const subRef = collection(db, "rooms", activeRoomRef.current, "submissions");
    const timestamp = getFormattedTime();

    await addDoc(subRef, {
      teamName,
      teamNumber,
      projectName,
      progressPercent: Number(progressPercent),
      answers,
      timestamp,
    });

    await addDoc(collection(db, "rooms", activeRoomRef.current, "activities"), {
      timestamp,
      description: `Team "${teamName}" submitted project progress (${progressPercent}% complete).`,
      type: "submit",
    });
  };

  const deleteSubmission = async (submissionId: string) => {
    try {
      const subDocRef = doc(db, "rooms", activeRoomRef.current, "submissions", submissionId);
      await deleteDoc(subDocRef);
    } catch (err) {
      console.error("Failed to delete submission:", err);
    }
  };

  const resetEvent = () => {
    subscribeToRoom("AI7X9");
  };

  return (
    <EventContext.Provider
      value={{
        eventName,
        eventLogo,
        roomCode,
        phases,
        announcements,
        participants,
        activities,
        submissions,
        formConfig,
        activePhaseIndex,
        timeRemaining,
        isRunning,
        isCompleted,
        user,
        authLoading,
        signInWithGoogle,
        signOutUser,
        subscribeToRoom,
        createEvent,
        updateSettings,
        startTimer,
        pauseTimer,
        addTime,
        nextPhase,
        prevPhase,
        addAnnouncement,
        joinEvent,
        addParticipant,
        deleteParticipant,
        updatePhase,
        deletePhase,
        endEvent,
        resetEvent,
        updateFormConfig,
        submitFormResponse,
        deleteSubmission,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}
