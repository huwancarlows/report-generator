'use client';
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Add redirect for logged-in users
  useEffect(() => {
    if (user && !loading) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-[#0a0a0a] dark:via-[#181c2a] dark:to-[#1a1a2a] text-black dark:text-white relative overflow-x-hidden">
      {/* Animated Gradient Background Blobs */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-blue-300 via-blue-100 to-purple-200 rounded-full blur-3xl opacity-40 animate-blob1 z-0" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-gradient-to-br from-purple-200 via-blue-100 to-blue-300 rounded-full blur-3xl opacity-30 animate-blob2 z-0" />

      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 sm:px-8 pt-10 gap-10 z-10">
        {/* Left: Hero & Quick Access */}
        <div className="flex-1 flex flex-col gap-8 justify-start lg:justify-center">
          {/* Hero Section */}
          <header className="flex flex-row items-center gap-5 animate-fade-in">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
              <Image
                src="/dole-logo.png"
                alt="DOLE Logo"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-300 tracking-tight drop-shadow-sm">
                PESO-MISOR EMPLOYMENT REPORT SYSTEM
              </h1>
              <p className="text-base sm:text-lg text-blue-700 dark:text-blue-200 font-semibold tracking-wide">
                PESO-MISOR ERS
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Department of Labor and Employment
              </p>
            </div>
          </header>

          {/* Quick Access */}
          <section className="mt-2 animate-fade-in delay-150">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Quick Access</h2>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/login?type=peso"
                className="group flex-1 flex flex-col items-center justify-center gap-3 px-8 py-7 bg-white/80 dark:bg-blue-950/80 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900 hover:scale-[1.03] hover:shadow-blue-200/40 dark:hover:shadow-blue-900/40 transition-all duration-200 ease-in-out cursor-pointer backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 animate-fade-in"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-blue-800 dark:text-blue-200">Login as PESO</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Sign in as PESO staff to access your dashboard and manage reports</span>
              </Link>
              <Link
                href="/login?type=ble"
                className="group flex-1 flex flex-col items-center justify-center gap-3 px-8 py-7 bg-white/80 dark:bg-purple-950/80 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900 hover:scale-[1.03] hover:shadow-purple-200/40 dark:hover:shadow-purple-900/40 transition-all duration-200 ease-in-out cursor-pointer backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-400 animate-fade-in"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-700 dark:text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-purple-800 dark:text-purple-200">Login as BLE</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Sign in as BLE administrator to access admin dashboard</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right: About Section */}
        <aside className="flex-1 flex flex-col justify-center items-center lg:items-start mt-10 lg:mt-0 animate-fade-in delay-200">
          <div className="p-8 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900 max-w-xl w-full flex flex-col items-center lg:items-start gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">About PESO-MISOR ERS</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-center lg:text-left">
              To implement an accessible, efficient, and accurate employment reporting system for all 26 Public Employment Service Offices (PESO) in Misamis Oriental. The system provides real-time access, ensures data accuracy through standardized reporting and uniform data entry, enables streamlined report tracking, and supports efficient generation of reports in prescribed formats.
            </p>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="w-full mt-16 mb-4 text-center text-sm text-gray-500 dark:text-gray-400 z-10">
        <div className="w-full flex justify-center mb-2">
          <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-900" />
        </div>
        <p>
          © {new Date().getFullYear()} Department of Labor and Employment. All rights reserved.
        </p>
      </footer>

      {/* Animations and extra styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes blob1 {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(20px); }
        }
        .animate-blob1 {
          animation: blob1 12s ease-in-out infinite;
        }
        @keyframes blob2 {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.07) translateY(-18px); }
        }
        .animate-blob2 {
          animation: blob2 14s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
