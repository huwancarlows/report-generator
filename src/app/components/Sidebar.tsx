"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { FaTachometerAlt, FaFileAlt, FaUser, FaUsersCog, FaSignOutAlt, FaBars, FaTimes, FaClipboardList, FaFolder } from "react-icons/fa";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from 'react-hot-toast';
import LoadingOverlay from "../LoadingOverlay";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarLoaded, setSidebarLoaded] = useState(false);

  useEffect(() => {
    setSidebarLoaded(true);
  }, []);

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

  const confirmLogout = async () => {
    const success = await logout();
    setIsOpen(false);
    setShowLogoutConfirm(false);
    if (success) {
      toast.success('Logged out successfully!');
      window.location.href = '/login';
    } else {
      toast.error('Failed to log out.');
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Overlay spinner for sidebar loading */}
      {(!user || user === null) && <LoadingOverlay show={true} />}
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
          bg-gradient-to-b from-gray-900 via-gray-950 to-blue-950 shadow-2xl border-r border-blue-200 dark:border-gray-800
          flex flex-col
          ${sidebarLoaded ? 'animate-sidebar-fade-in' : ''}
        `}
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        }}
      >
        <div className={`h-full flex flex-col px-2 py-4 ${isOpen ? 'overflow-y-auto' : 'overflow-hidden'} scrollbar-none scrollbar-thumb-gray-800 ${isOpen ? '' : 'items-center justify-center px-0 py-0'}`}>
          {/* Logo Section */}
          <div className={`flex flex-col items-center justify-center ${isOpen ? 'mb-10 mt-12 px-2' : 'mb-4 mt-4 px-0'} w-full`} style={{ minHeight: isOpen ? 'auto' : '72px' }}>
            <div className="flex flex-col items-center w-full">
              <div className="relative w-12 h-12 flex-shrink-0 mb-2">
                <Image
                  src="/images/dole-logo.png"
                  alt="DOLE Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {isOpen && (
                <div className="flex flex-col items-center w-full">
                  <span className="text-2xl font-bold text-white tracking-tight leading-tight">PESO</span>
                  <span className="text-xs text-blue-200 font-medium tracking-wide mt-0.5">Region X</span>
                  <span className="text-[11px] text-gray-400 font-normal mt-0.5">Public Employment Service Office</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1">
            {navigationItems
              .filter(item => item.roles.includes(user?.role || ""))
              .map((item, index) => {
                const isActive = pathname === item.href;
                const isDisabled = !user || user === null;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (isDisabled) return;
                      if (window.innerWidth < 640) setIsOpen(false);
                      router.push(item.href);
                      router.refresh();
                    }}
                    className={`group flex items-center ${isOpen ? 'gap-3 px-5 py-2 my-2' : 'justify-center px-0 py-3 my-1'} rounded-lg font-medium transition-all duration-200 relative
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-700/80 to-blue-600/60 text-white shadow-md'
                        : isDisabled
                          ? 'text-gray-600 cursor-not-allowed opacity-60'
                          : 'text-gray-200 hover:bg-blue-800/60 hover:text-white'}
                      focus:outline-none focus:ring-2 focus:ring-blue-400
                    `}
                    style={{
                      borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                      boxShadow: isActive ? '0 2px 8px 0 rgba(59,130,246,0.08)' : undefined,
                      width: isOpen ? '100%' : '48px',
                      minHeight: isOpen ? undefined : '48px',
                    }}
                    tabIndex={isDisabled ? -1 : 0}
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    title={!isOpen ? item.label : undefined}
                  >
                    <span className={`transition-colors ${isActive ? 'text-blue-200' : isDisabled ? 'text-gray-600' : 'text-blue-300 group-hover:text-white'}`}>{item.icon}</span>
                    {isOpen && (
                      <>
                        <span className="ml-1 flex-1 whitespace-nowrap text-base">{item.label}</span>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-400 rounded-full" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
          </nav>

          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className={`group flex items-center gap-3 w-full rounded-lg px-3 py-2 font-medium text-gray-200 hover:bg-gray-800 hover:text-red-400 transition-all duration-200 relative ${isOpen ? '' : 'justify-center'}`}
              disabled={!user || user === null}
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
        <style jsx>{`
          .animate-sidebar-fade-in {
            animation: sidebarFadeIn 0.5s cubic-bezier(0.4,0,0.2,1);
          }
          @keyframes sidebarFadeIn {
            from { opacity: 0; transform: translateX(-32px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </aside>
    </>
  );
}
