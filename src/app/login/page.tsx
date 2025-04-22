"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient"; // Import supabase client from utils

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(""); // Reset error state

    try {
      // Query the profiles table to check if the email and password match
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

      // If login is successful, store user data in localStorage or a global state
      localStorage.setItem("user", JSON.stringify(data));

      // If login is successful, check the role and redirect accordingly
      if (data) {
        if (data.role === "admin") {
          router.push("/admin");
        } else if (data.role === "user") {
          router.push("/user");
        }
      }
    } catch (err) {
      // Handle any other errors (e.g., network issues)
      setError("An error occurred while connecting to the server. Please try again later.");
      console.error("Error during login:", err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#111] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Login to your account
        </h2>

        {/* Display error messages */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-white dark:bg-[#1a1a1a] dark:text-white"
              placeholder="e.g. admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-white dark:bg-[#1a1a1a] dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading} // Disable the button while loading
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-blue-300"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
