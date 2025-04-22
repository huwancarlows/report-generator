"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Dummy user data
const users = [
  {
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    email: "user@example.com",
    password: "user123",
    role: "user",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      if (foundUser.role === "admin") {
        router.push("/admin");
      } else if (foundUser.role === "user") {
        router.push("/user");
      } 
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#111] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Login to your account
        </h2>
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
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Admin: <code>admin@example.com / admin123</code> <br />
          User: <code>user@example.com / user123</code>
        </p>
      </div>
    </div>
  );
}
