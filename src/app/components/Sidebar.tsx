"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { role, logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4 flex flex-col gap-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/report" className="hover:underline">Report</Link>
        <Link href="/profile" className="hover:underline">Profile</Link>

        {role === "admin" && (
          <Link href="/admin" className="hover:underline">Admin</Link>
        )}
        {role === "user" && (
          <Link href="/user" className="hover:underline">User</Link>
        )}

        <button
          onClick={logout}
          className="text-left text-red-500 hover:underline"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
