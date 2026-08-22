"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useEvent } from "@/context/event-context";
import { Menu, X, LogOut, Loader2, ArrowRight } from "lucide-react";
import { GlowButton } from "./ui/glow-button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, authLoading, signInWithGoogle, signOutUser } = useEvent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Product", href: "#product" },
    { name: "Features", href: "#features" },
    { name: "Stage Mode", href: "#stage-showcase" },
    { name: "How It Works", href: "#how-it-works" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/10 py-3"
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 select-none group">
              <div className="relative flex items-center justify-center w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary text-glow-primary transform group-hover:scale-110 transition-transform duration-300"
                >
                  <path d="M4 12h3l2-6 3 12 2-9 2 5h4" />
                </svg>
              </div>
              <span className="text-white font-bold tracking-tight text-lg group-hover:text-glow-primary transition-all duration-300">
                HackPulse
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {authLoading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-muted animate-spin" />
                </div>
              ) : user ? (
                /* Authenticated State */
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-1.5 pr-3 select-none hover:bg-white/10 transition-colors"
                    title={`Logged in as ${user.displayName}`}
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-6 h-6 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-xs text-primary font-mono">
                        {user.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold text-white max-w-[100px] truncate">
                      {user.displayName?.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={signOutUser}
                    className="text-muted hover:text-danger p-1 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Unauthenticated State */
                <button
                  onClick={signInWithGoogle}
                  className="text-sm font-bold text-muted hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Sign In
                </button>
              )}

              <Link href="/control">
                <GlowButton variant="primary" size="sm">
                  Launch Control Room
                </GlowButton>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-muted hover:text-white focus:outline-none cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#050505]/98 backdrop-blur-xl z-30 pt-24 px-6 md:hidden flex flex-col justify-between pb-8"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-semibold text-muted hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2" />
              {user ? (
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    {user.photoURL && (
                      <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-lg" />
                    )}
                    <span className="text-white font-bold text-sm">{user.displayName}</span>
                  </div>
                  <button onClick={() => { signOutUser(); setIsMobileMenuOpen(false); }} className="text-danger flex gap-1 items-center font-bold">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { signInWithGoogle(); setIsMobileMenuOpen(false); }}
                  className="text-xl font-semibold text-muted hover:text-white text-left"
                >
                  Sign In (Google)
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/control" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <GlowButton variant="primary" size="lg" className="w-full">
                  Launch Control Room
                </GlowButton>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
