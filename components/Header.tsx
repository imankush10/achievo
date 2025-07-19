"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  PlayIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export const Header = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="h-24">
      {/* This creates the top margin/spacing */}
      <nav className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 w-[90%] rounded-md">
        {/* Glassmorphism background with gradient blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/30 via-neutral-900 to-neutral-900/30 backdrop-blur-md rounded-md border border-white/10"></div>

        <div className="relative flex h-20 items-center justify-between px-6">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Achievo</h1>
                <p className="text-xs text-white/70">
                  Let's achieve it
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="nav-link">
              📚 Dashboard
            </Link>
            <Link href="/analytics" className="nav-link">
              📊 Analytics
            </Link>
            <Link href="/profile" className="nav-link">
              👤 Profile
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full ring-2 ring-white/30"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-white/80" />
                  )}
                  <span className="text-sm font-medium text-white/90">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-200 border border-red-500/30 backdrop-blur-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="bg-white/90 hover:bg-white text-black px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium backdrop-blur-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-r from-white/10 via-white/25 to-white/10 backdrop-blur-md rounded-2xl border border-white/10 md:hidden">
            <div className="px-6 py-4">
              <div className="flex flex-col space-y-2 mb-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📚 Dashboard
                </Link>
                <Link
                  href="/analytics"
                  className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📊 Analytics
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  👤 Profile
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
