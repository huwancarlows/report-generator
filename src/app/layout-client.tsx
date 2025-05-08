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

  // Don't show sidebar on login page or home page
  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";
  const shouldShowSidebar = user && !isLoginPage && !isHomePage;

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
          <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-800">
            <div className={`flex items-center justify-between px-8 py-4 ${shouldShowSidebar ? 'ml-16 sm:ml-0' : ''} ${isSidebarOpen ? 'mr-0' : ''}`}>
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12 drop-shadow-md">
                  <Image
                    src="/dole-logo.png"
                    alt="DOLE Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    DOLE Region X
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    Public Employment Service Office
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-5">
                <div className="text-right group cursor-pointer transition-all">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-400 transition-colors">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-300 dark:ring-blue-900 transition-all hover:scale-105 cursor-pointer">
                  <span className="text-white font-bold text-lg select-none">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </header>
        )}
        <div className={`${shouldShowSidebar ? 'p-6 ml-16 sm:ml-0' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
