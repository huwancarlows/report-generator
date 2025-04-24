"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBLE, setIsBLE] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (loginError || !data) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      // Check role-based access
      if (isBLE && data.role !== "admin") {
        setError("Access denied. BLE login is only for administrators.");
        setLoading(false);
        return;
      }

      if (!isBLE && data.role !== "user") {
        setError("Access denied. PESO login is only for PESO users.");
        setLoading(false);
        return;
      }

      const userData = {
        id: data.id,
        email: data.email,
        role: data.role,
        name: data.name,
        municipal_mayor: data.municipal_mayor,
        address: data.address
      };

      login(userData);

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
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

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${isBLE
      ? 'from-purple-50 via-indigo-50 to-blue-50'
      : 'from-blue-50 via-indigo-50 to-purple-50'
      }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-40 bg-grid-pattern"></div>

      <div className="w-full max-w-[480px] mx-auto px-4 relative z-10">
        {/* Login Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300">
            <button
              onClick={toggleLoginType}
              className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${!isBLE
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
            >
              PESO
            </button>
            <button
              onClick={toggleLoginType}
              className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${isBLE
                ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
            >
              BLE
            </button>
          </div>
        </div>

        {/* Logo and Brand Section */}
        <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className={`flex-shrink-0 w-16 h-16 ${isBLE ? 'bg-purple-600' : 'bg-blue-600'
              } rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-3`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            {/* Text Content */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{isBLE ? 'BLE' : 'PESO'}</h1>
              <p className="text-base text-gray-600 font-medium">
                {isBLE ? 'Bureau of Local Employment' : 'Public Employment Service Office'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isBLE ? 'Administrator Access Only' : 'PESO Staff Access Only'}
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm py-8 px-8 shadow-xl rounded-2xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Welcome
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Sign in to access your {isBLE ? 'admin dashboard' : 'PESO dashboard'}
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center animate-shake">
              <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
              disabled={loading}
              className={`w-full py-3 px-4 ${isBLE
                ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                } text-white font-medium rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
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

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-600">
            Department of Labor and Employment
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} {isBLE ? 'BLE' : 'PESO'}. All rights reserved.
          </p>
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
      `}</style>
    </div>
  );
}
