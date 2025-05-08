"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation";

function getInitials(email: string) {
  if (!email) return "?";
  const [name] = email.split("@");
  return name
    .split(/[._-]/)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#1e293b]">
        <div className="animate-fade-in bg-white/70 dark:bg-[#18181b]/70 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center border border-blue-100 dark:border-[#222] backdrop-blur-md">
          <div className="dual-ring mb-4" />
          <span className="text-lg font-medium text-blue-700 dark:text-blue-200 tracking-wide">Loading profile...</span>
        </div>
        <style jsx>{`
          .dual-ring {
            display: inline-block;
            width: 48px;
            height: 48px;
          }
          .dual-ring:after {
            content: " ";
            display: block;
            width: 36px;
            height: 36px;
            margin: 6px;
            border-radius: 50%;
            border: 5px solid #2563eb;
            border-color: #2563eb transparent #60a5fa transparent;
            animation: dual-ring-spin 1.1s linear infinite;
          }
          @keyframes dual-ring-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#1e293b]">
        <div className="bg-white/80 dark:bg-[#18181b]/80 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center border border-red-200 dark:border-[#222] backdrop-blur-md animate-fade-in">
          <p className="text-lg font-medium text-red-600 dark:text-red-400 tracking-wide mb-4">Please log in to view your profile.</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition flex items-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
            Go to Login
          </button>
          <style jsx>{`
            .animate-fade-in {
              animation: fadeIn 0.4s;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#1e293b]">
      <div className="w-full max-w-lg p-8 bg-white/80 dark:bg-[#18181b]/80 rounded-2xl shadow-2xl border border-blue-100 dark:border-[#222] backdrop-blur-md animate-fade-in relative">
        {/* Decorative shape */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-200 dark:bg-blue-900 opacity-30 rounded-full blur-2xl z-0" />
        {/* User Avatar */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 border-4 border-white dark:border-[#18181b]">
            {getInitials(user.email)}
          </div>
          <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-1 tracking-tight">Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4 text-base">Your account information and access rights</p>
        </div>
        <div className="border-t border-blue-100 dark:border-gray-800 my-4" />
        <div className="space-y-6 z-10 relative">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-500 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">User ID</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-500 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0 4 4 0 018 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Email</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-500 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5v9" />
            </svg>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Role</p>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-blue-100 dark:border-gray-800 my-6" />
        <div className="mt-6 z-10 relative">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
            Access Information
          </h2>
          <ul className="space-y-2 text-sm">
            {user.role === 'admin' ? (
              <>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Full administrative access
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Can manage users and reports
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Can view all dashboard data
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Standard user access
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Can view and create reports
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Can view personal dashboard
                </li>
              </>
            )}
          </ul>
        </div>
        <style jsx>{`
          .animate-fade-in {
            animation: fadeIn 0.5s cubic-bezier(0.4,0,0.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
} 