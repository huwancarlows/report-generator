"use client";

import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Don't show sidebar on login page
  const isLoginPage = pathname === "/login";
  const shouldShowSidebar = user && !isLoginPage;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {shouldShowSidebar && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
      <main
        className={`min-h-screen transition-all duration-300 ${shouldShowSidebar
          ? isSidebarOpen
            ? 'sm:ml-64' // Sidebar expanded
            : 'sm:ml-16' // Sidebar collapsed
          : ''          // No sidebar
          }`}
      >
        {shouldShowSidebar && (
          <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm">
            <div className={`flex items-center justify-between max-w-7xl mx-auto px-6 py-4 ${shouldShowSidebar ? 'ml-16 sm:ml-0' : ''
              }`}>
              <div className="flex items-center space-x-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/images/dole-logo.png"
                    alt="DOLE Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    DOLE Region X
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Public Employment Service Office
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </header>
        )}
        <div className={`p-6 ${shouldShowSidebar ? 'ml-16 sm:ml-0' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
