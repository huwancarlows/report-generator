"use client";

import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import { usePathname } from "next/navigation";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

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
    <div className="flex min-h-screen">
      {shouldShowSidebar && <Sidebar />}
      <main className={`flex-1 p-6 ${!shouldShowSidebar ? 'mx-auto max-w-4xl' : ''}`}>
        {shouldShowSidebar && (
          <header className="mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">Your App Name</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome!</p>
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
