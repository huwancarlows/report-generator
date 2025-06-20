"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBLE, setIsBLE] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Set login type from query param on mount
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'ble') setIsBLE(true);
    else setIsBLE(false);
  }, [searchParams]);

  // Track login success and redirect after user is set
  useEffect(() => {
    if (loginAttempted && user && !authLoading && showSuccess) {
      const timeout = setTimeout(() => {
        // Role-based redirect after login
        if (isBLE && user.role !== "admin") {
          setError("Access denied. BLE login is only for administrators.");
          setShowSuccess(false);
          setLoginAttempted(false);
          return;
        }
        if (!isBLE && user.role !== "user") {
          setError("Access denied. PESO login is only for PESO users.");
          setShowSuccess(false);
          setLoginAttempted(false);
          return;
        }
        if (user.role === "admin") {
          window.location.href = "/admin?justLoggedIn=true";
        } else {
          window.location.href = "/dashboard?justLoggedIn=true";
        }
        setLoginAttempted(false);
      }, 2000); // 2 seconds for modal visibility
      return () => clearTimeout(timeout);
    }
  }, [showSuccess, user, authLoading, isBLE, router, loginAttempted]);

  useEffect(() => {
    if (user && !authLoading && !showSuccess) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, authLoading, showSuccess, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowSuccess(false);
    setLoginAttempted(false);

    try {
      await login(email, password);
      setShowSuccess(true); // Only set this after successful login
      setLoginAttempted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginType = () => {
    setIsBLE(!isBLE);
    setError("");
    setEmail("");
    setPassword("");
  };

  // If showSuccess, show only the modal (no form, no spinner)
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 max-w-xs w-full flex flex-col items-center animate-fade-scale-in border border-green-200">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-green-700 mb-1">Login Successful!</h3>
          <p className="text-sm text-gray-600 text-center mb-1">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${isBLE
      ? 'from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950'
      : 'from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950'
      } text-black dark:text-blue-100 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-40 bg-grid-pattern pointer-events-none dark:opacity-20"></div>

      <div className="w-full max-w-3xl mx-auto px-4 relative z-10">
        {/* Login Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 dark:bg-[#232b3e]/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-gray-200 dark:border-blue-900 flex gap-2">
            <button
              onClick={() => { if (isBLE) toggleLoginType(); }}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-900 ${!isBLE
                ? 'bg-blue-600 text-white shadow-md scale-105 dark:bg-blue-800'
                : 'text-gray-600 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40'}
                `}
              style={{ minWidth: 90 }}
            >
              PESO
            </button>
            <button
              onClick={() => { if (!isBLE) toggleLoginType(); }}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-900 ${isBLE
                ? 'bg-purple-600 text-white shadow-md scale-105 dark:bg-purple-800'
                : 'text-gray-600 dark:text-purple-100 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/40'}
                `}
              style={{ minWidth: 90 }}
            >
              BLE
            </button>
          </div>
        </div>

        {/* Card Layout */}
        <div className="bg-white/95 dark:bg-[#181c2a]/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-blue-900 flex flex-col md:flex-row overflow-hidden hover:shadow-blue-200/40 dark:hover:shadow-blue-900/40 transition-shadow duration-300">
          {/* Logo/Brand Section */}
          <div className="flex flex-col items-center justify-center md:items-center md:justify-center md:w-1/2 p-10 bg-gradient-to-br from-white/90 to-blue-50 dark:from-[#232b3e]/90 dark:to-blue-900/40 relative">
            <div className="flex flex-col items-center w-full">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-white dark:bg-[#181c2a] border border-gray-200 dark:border-blue-900 mb-4">
                <Image
                  src={isBLE ? '/images/dole-logo.png' : '/images/peso-logo.png'}
                  alt={isBLE ? 'DOLE Logo' : 'PESO Logo'}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <h1 className={`text-3xl font-extrabold ${isBLE ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'} mb-1 tracking-tight`}>{isBLE ? 'BLE' : 'PESO'}</h1>
              <p className="text-base text-gray-700 dark:text-blue-100 font-medium">
                {isBLE ? 'Bureau of Local Employment' : 'Public Employment Service Office'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isBLE ? 'Administrator Access Only' : 'PESO Staff Access Only'}
              </p>
            </div>
            {/* Divider for desktop */}
            <div className="hidden md:block absolute top-8 right-0 h-[80%] w-px bg-gradient-to-b from-gray-200/80 to-gray-100/0 dark:from-blue-900/60 dark:to-blue-900/0" />
          </div>

          {/* Login Form Section */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12 bg-white dark:bg-[#181c2a]">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-blue-100 mb-2 text-left tracking-tight">
              Welcome
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-8 text-left">
              Sign in to access your {isBLE ? 'admin dashboard' : 'PESO dashboard'}
            </p>
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-400 flex items-center animate-shake shadow-sm">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">Login failed</p>
                  <p className="text-sm text-red-600 dark:text-red-100">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-300 group-hover:text-gray-500 dark:group-hover:text-blue-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-900 bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100 text-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-blue-200 hover:border-blue-400 dark:hover:border-blue-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-300 group-hover:text-gray-500 dark:group-hover:text-blue-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-900 bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100 text-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-blue-200 hover:border-blue-400 dark:hover:border-blue-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-200 hover:text-gray-600 dark:hover:text-blue-100 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className={`w-full py-3 px-4 ${isBLE
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-800 dark:hover:bg-purple-900 dark:focus:ring-purple-900'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-800 dark:hover:bg-blue-900 dark:focus:ring-blue-900'
                  } text-white font-semibold rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-xs">
          <p className="font-medium">Department of Labor and Employment</p>
          <p className="mt-1">© {new Date().getFullYear()} {isBLE ? 'BLE' : 'PESO'}. All rights reserved.</p>
        </div>
      </div>

      {/* Add styles for background pattern and animations */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-scale-in {
          animation: fadeScaleIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
}
