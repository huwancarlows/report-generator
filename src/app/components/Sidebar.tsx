"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { FaTachometerAlt, FaFileAlt, FaUser, FaUsersCog, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <aside
      className={`w-64 bg-gray-100 dark:bg-gray-900 p-4 flex flex-col gap-4 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden sm:block"}`}
    >
      {/* Sidebar Toggle Button */}
      <button
        className="text-white bg-gray-700 p-2 rounded-full absolute top-4 left-4 sm:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? "Hide" : "Show"}
      </button>

      <h2 className="text-lg font-semibold mb-4">Menu</h2>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 hover:underline">
          <FaTachometerAlt />
          <span className={isSidebarOpen ? "block" : "hidden"}>Dashboard</span>
        </Link>
        <Link href="/report" className="flex items-center gap-2 hover:underline">
          <FaFileAlt />
          <span className={isSidebarOpen ? "block" : "hidden"}>Report</span>
        </Link>
        <Link href="/report-entry" className="flex items-center gap-2 hover:underline">
          <FaFileAlt />
          <span className={isSidebarOpen ? "block" : "hidden"}>Report Entry</span>
        </Link>
        <Link href="/profile" className="flex items-center gap-2 hover:underline">
          <FaUser />
          <span className={isSidebarOpen ? "block" : "hidden"}>Profile</span>
        </Link>

        {role === "admin" && (
          <Link href="/admin" className="flex items-center gap-2 hover:underline">
            <FaUsersCog />
            <span className={isSidebarOpen ? "block" : "hidden"}>Admin</span>
          </Link>
        )}

        {role === "user" && (
          <Link href="/user" className="flex items-center gap-2 hover:underline">
            <FaUser />
            <span className={isSidebarOpen ? "block" : "hidden"}>User</span>
          </Link>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 text-left text-red-500 hover:underline"
        >
          <FaSignOutAlt />
          <span className={isSidebarOpen ? "block" : "hidden"}>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
