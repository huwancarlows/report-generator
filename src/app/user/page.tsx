"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

function getInitials(email: string) {
  if (!email) return "?";
  const [name] = email.split("@");
  return name
    .split(/[._-]/)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
}

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (!userData || !userData.email) {
          setError("User not logged in.");
          router.push("/login");
          return;
        }
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("email, role")
          .eq("email", userData.email)
          .single();
        if (fetchError) {
          setError("Error fetching user data.");
          return;
        }
        if (data) {
          setUser(data);
        }
      } catch (error) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#1e293b]">
        <div className="animate-fade-in bg-white/70 dark:bg-[#18181b]/70 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center border border-blue-100 dark:border-[#222] backdrop-blur-md">
          <div className="dual-ring mb-4" />
          <span className="text-lg font-medium text-blue-700 dark:text-blue-200 tracking-wide">Loading your dashboard...</span>
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#1e293b]">
        <div className="bg-white/80 dark:bg-[#18181b]/80 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center border border-red-200 dark:border-[#222] backdrop-blur-md animate-fade-in">
          <span className="text-lg font-medium text-red-600 dark:text-red-400 tracking-wide">{error}</span>
        </div>
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#1e293b]">
      <div className="w-full max-w-md p-8 bg-white/80 dark:bg-[#18181b]/80 rounded-2xl shadow-2xl border border-blue-100 dark:border-[#222] backdrop-blur-md animate-fade-in relative">
        {/* Decorative shape */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-200 dark:bg-blue-900 opacity-30 rounded-full blur-2xl z-0" />
        {/* User Avatar */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 border-4 border-white dark:border-[#18181b]">
            {getInitials(user.email)}
          </div>
          <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-2 tracking-tight">Welcome!</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-base">This is your personalized dashboard.</p>
        </div>
        <div className="border-t border-blue-100 dark:border-gray-800 my-4" />
        <div className="mb-6 z-10 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-700 dark:text-gray-200 font-semibold">Email:</span>
            <span className="text-gray-900 dark:text-white break-all">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-200 font-semibold">Role:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium">
              {user.role || "User role not assigned"}
            </span>
          </div>
        </div>
        <button
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-md z-10 relative"
          onClick={() => {
            localStorage.removeItem("user");
            router.push("/login");
          }}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
          </svg>
          Log Out
        </button>
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
