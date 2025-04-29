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

  // Close sidebar on route changes for mobile only
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

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
        className="fixed top-4 left-4 z-50 inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>

      {/* Overlay - Show on mobile only when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm z-50" onClick={cancelLogout} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-96 p-6 border border-gray-200">
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
        </>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'
          }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-900">
          {/* Logo Section */}
          <div className={`flex items-center justify-center mb-6 mt-12 ${isOpen ? 'px-2' : 'px-0'}`}>
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
                  <span className="text-xl font-semibold text-white">PESO</span>
                  <span className="text-xs text-gray-400">Region X</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-2">
            {navigationItems
              .filter(item => item.roles.includes(role || ""))
              .map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => window.innerWidth < 640 && setIsOpen(false)}
                    className={`flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'
                      } text-base rounded-lg transition-colors ${isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group relative`}
                  >
                    <div className={`transition-colors ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-white'}`}>
                      {item.icon}
                    </div>
                    {isOpen ? (
                      <>
                        <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>
                        {isActive && (
                          <div className="w-1.5 h-8 bg-blue-500 rounded-full ml-3"></div>
                        )}
                      </>
                    ) : (
                      <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-900 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
          </div>

          {/* Update Logout Button onClick */}
          <div className="pt-4 mt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className={`flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'
                } w-full text-base text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors group relative`}
            >
              <FaSignOutAlt className="w-5 h-5 text-gray-400 group-hover:text-white" />
              {isOpen ? (
                <span className="ml-1 flex-1 whitespace-nowrap">Logout</span>
              ) : (
                <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-900 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
