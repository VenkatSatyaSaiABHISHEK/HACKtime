"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/context/event-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowButton } from "@/components/ui/glow-button";
import { Calendar, Key, AlertTriangle, ShieldCheck, RefreshCcw, Upload, Image } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { eventName, eventLogo, roomCode, updateSettings, resetEvent } = useEvent();

  const [name, setName] = useState(eventName);
  const [logoUrl, setLogoUrl] = useState(eventLogo);
  const [code, setCode] = useState(roomCode);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync state if context loads asynchronously
  useEffect(() => {
    setName(eventName);
    setLogoUrl(eventLogo);
    setCode(roomCode);
  }, [eventName, eventLogo, roomCode]);

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
        setLogoUrl(data.url);
      }
    } catch (err) {
      console.error("Failed to upload logo:", err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setLoading(true);
    setSuccess(false);

    try {
      await updateSettings(name, code, logoUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetEvent();
    router.push("/");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#0891b2] text-glow-secondary uppercase">
            OPERATIONAL PREFERENCES
          </span>
          <h2 className="text-2xl font-black text-white font-mono tracking-tight uppercase mt-0.5">
            ROOM SETTINGS
          </h2>
        </div>

        {/* Configuration Forms */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassPanel className="p-6 border-white/10 space-y-6">
            <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase mb-1">
              EVENT CONFIGURATION
            </h3>

            {success && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-xs text-success font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Event preferences saved and updated in database successfully!</span>
              </div>
            )}

            {/* Event Name */}
            <div>
              <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block mb-2">
                EVENT NAME
              </label>
              <div
                className={`flex items-center border rounded-xl px-4 py-3 bg-[#050505]/40 transition-all duration-300 ${
                  focusedField === "name"
                    ? "border-primary shadow-[0_0_15px_rgba(124,58,237,0.15)] bg-black"
                    : "border-white/10"
                }`}
              >
                <Calendar className="w-4 h-4 text-muted mr-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className="bg-transparent text-sm text-white font-medium focus:outline-none w-full"
                  placeholder="Event Name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Event Logo Uploader */}
            <div>
              <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block mb-2">
                EVENT LOGO IMAGE
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {logoUrl ? (
                  <div className="w-16 h-16 rounded-xl border border-white/10 bg-[#050505] p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-white/5 bg-[#050505] flex items-center justify-center flex-shrink-0 text-muted">
                    <Image className="w-6 h-6" />
                  </div>
                )}
                
                <div className="flex-1 w-full space-y-2">
                  <div
                    className={`flex items-center border rounded-xl px-4 py-3 bg-[#050505]/40 transition-all duration-300 ${
                      focusedField === "logo"
                        ? "border-primary shadow-[0_0_15px_rgba(124,58,237,0.15)] bg-black"
                        : "border-white/10"
                    }`}
                  >
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      onFocus={() => setFocusedField("logo")}
                      onBlur={() => setFocusedField(null)}
                      className="bg-transparent text-xs text-white focus:outline-none w-full placeholder:text-muted"
                      placeholder="Paste Image URL or upload a file..."
                      disabled={loading || uploadingLogo}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="logo-file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={loading || uploadingLogo}
                    />
                    <label
                      htmlFor="logo-file"
                      className="inline-flex items-center justify-center font-mono text-[10px] font-bold tracking-wider px-3.5 py-2.5 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-white hover:bg-white/10 cursor-pointer transition-all uppercase select-none gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-primary" /> {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl("")}
                        className="text-[10px] font-mono font-bold text-danger hover:underline cursor-pointer uppercase"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Code */}
            <div>
              <label className="text-[9px] font-mono font-bold tracking-widest text-muted uppercase block mb-2">
                ROOM CODE IDENTIFIER
              </label>
              <div
                className={`flex items-center border rounded-xl px-4 py-3 bg-[#050505]/40 transition-all duration-300 ${
                  focusedField === "code"
                    ? "border-secondary shadow-[0_0_15px_rgba(8,145,178,0.15)] bg-black"
                    : "border-white/10"
                }`}
              >
                <Key className="w-4 h-4 text-muted mr-3" />
                <input
                  type="text"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onFocus={() => setFocusedField("code")}
                  onBlur={() => setFocusedField(null)}
                  className="bg-transparent text-sm font-bold tracking-widest font-mono text-white focus:outline-none w-full uppercase"
                  placeholder="e.g. AI7X9"
                  disabled={loading}
                />
              </div>
              <p className="text-[10px] text-muted font-mono leading-relaxed mt-2 uppercase">
                Warning: Editing the room code shifts the active collection ID. Existing subscribers will lose sync.
              </p>
            </div>

            <GlowButton type="submit" variant="primary" size="sm" disabled={loading || uploadingLogo}>
              {loading ? "Saving Preferences..." : "Save Preferences"}
            </GlowButton>
          </GlassPanel>
        </form>

        {/* Danger Zone */}
        <GlassPanel className="p-6 border-danger/20 bg-danger/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-danger font-mono tracking-wider uppercase mb-1">
              DANGER ZONE
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Resetting this event terminates all active timers, drops connections to participants, and clears local cached storage credentials.
            </p>
          </div>

          <div className="pt-2">
            <GlowButton variant="danger" size="sm" onClick={handleReset}>
              Terminate Event Room & Reset <RefreshCcw className="w-3.5 h-3.5 ml-1.5" />
            </GlowButton>
          </div>
        </GlassPanel>
      </div>
    </DashboardLayout>
  );
}
