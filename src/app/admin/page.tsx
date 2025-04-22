"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111] p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold"
        >
          Logout
        </button>
      </header>

      {/* Dashboard Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">1,240</p>
        </div>

        <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Active Reports</h3>
          <p className="text-2xl font-bold text-green-500">58</p>
        </div>

        <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Pending Requests</h3>
          <p className="text-2xl font-bold text-yellow-500">14</p>
        </div>
      </section>
    </div>
  );
}
