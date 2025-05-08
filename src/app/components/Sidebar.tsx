"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { FaTachometerAlt, FaFileAlt, FaUser, FaUsersCog, FaSignOutAlt, FaBars, FaTimes, FaClipboardList, FaFolder } from "react-icons/fa";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { role, logout } = useAuth();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Responsive: close sidebar on route changes for mobile only
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isOpen && window.innerWidth < 640) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navigationItems = [
    {
      href: "/dashboard",
      icon: <FaTachometerAlt className="w-5 h-5" />,
      label: "Dashboard",
      roles: ["admin", "user"]
    },
    {
      href: "/report",
      icon: <FaFolder className="w-5 h-5" />,
      label: "Forms",
      roles: ["user"]
    },
    {
      href: "/report-entry",
      icon: <FaClipboardList className="w-5 h-5" />,
      label: "Report Entry",
      roles: ["user"]
    },
    {
      href: "/profile",
      icon: <FaUser className="w-5 h-5" />,
      label: "Profile",
      roles: ["admin", "user"]
    },
    {
      href: "/admin",
      icon: <FaUsersCog className="w-5 h-5" />,
      label: "Reports",
      roles: ["admin"]
    }
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setIsOpen(false);
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[101] inline-flex items-center p-2 text-sm text-gray-500 rounded-full bg-gray/80 shadow-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>

      {/* Overlay - Show on mobile only when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-50 sm:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 z-[201] bg-black/30 backdrop-blur-sm" onClick={cancelLogout} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[202] w-80 max-w-full p-7 border border-gray-200 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
                <FaSignOutAlt className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to log out? Any unsaved changes will be lost.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <style jsx>{`
            .animate-fade-in {
              animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[100] h-screen transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-16'}
          bg-gray-900 shadow-xl border-r border-blue-100 dark:border-gray-800
          flex flex-col
        `}
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        }}
      >
        <div className="h-full flex flex-col px-2 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          {/* Logo Section */}
          <div className={`flex items-center justify-center mb-8 mt-12 ${isOpen ? 'px-2' : 'px-0'}`}>
            <div className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'}`}>
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/images/dole-logo.png"
                  alt="DOLE Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {isOpen && (
                <div className="flex flex-col">
                  <span className="text-xl font-semibold text-white tracking-tight">PESO</span>
                  <span className="text-xs text-gray-400">Region X</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1">
            {navigationItems
              .filter(item => item.roles.includes(role || ""))
              .map((item, index) => {
                const isActive = pathname === item.href;
                const isDisabled = false; // You can set this based on your logic
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => window.innerWidth < 640 && setIsOpen(false)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 my-1 font-medium transition-all duration-200 relative
                      ${isActive
                        ? 'bg-gray-800 text-blue-300 shadow-sm'
                        : isDisabled
                          ? 'text-gray-600 cursor-not-allowed opacity-60'
                          : 'text-gray-200 hover:bg-gray-800 hover:text-blue-200'}
                      ${isOpen ? '' : 'justify-center'}
                    `}
                    tabIndex={isDisabled ? -1 : 0}
                    aria-disabled={isDisabled}
                  >
                    <span className={`transition-colors ${isActive ? 'text-blue-400' : isDisabled ? 'text-gray-600' : 'text-gray-400 group-hover:text-blue-200'}`}>{item.icon}</span>
                    {isOpen ? (
                      <>
                        <span className="ml-1 flex-1 whitespace-nowrap text-base">{item.label}</span>
                        {isActive && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-full" />
                        )}
                      </>
                    ) : (
                      <span className="absolute left-full rounded-md px-2 py-1 ml-3 bg-gray-800 text-white text-xs shadow-lg invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
          </nav>

          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className={`group flex items-center gap-3 w-full rounded-lg px-3 py-2 font-medium text-gray-200 hover:bg-gray-800 hover:text-red-400 transition-all duration-200 relative ${isOpen ? '' : 'justify-center'}`}
            >
              <FaSignOutAlt className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
              {isOpen ? (
                <span className="ml-1 flex-1 whitespace-nowrap">Logout</span>
              ) : (
                <span className="absolute left-full rounded-md px-2 py-1 ml-3 bg-gray-800 text-white text-xs shadow-lg invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
