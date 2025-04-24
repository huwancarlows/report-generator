"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { FaTachometerAlt, FaFileAlt, FaUser, FaUsersCog, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { role, logout } = useAuth();
  const pathname = usePathname();

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
      icon: <FaFileAlt className="w-5 h-5" />,
      label: "Report",
      roles: ["user"]
    },
    {
      href: "/report-entry",
      icon: <FaFileAlt className="w-5 h-5" />,
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
      label: "Admin",
      roles: ["admin"]
    }
  ];

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

          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-gray-700">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className={`flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'
                } w-full text-base text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors group relative`}
            >
              <FaSignOutAlt className="w-5 h-5 text-gray-400 group-hover:text-white" />
              {isOpen ? (
                <span className="ml-3 flex-1 whitespace-nowrap">Logout</span>
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
