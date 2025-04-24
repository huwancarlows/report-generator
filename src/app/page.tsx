import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center p-6 sm:p-12 font-[var(--font-geist-sans)] bg-gradient-to-b from-white to-blue-50 dark:from-[#0a0a0a] dark:to-[#1a1a1a] text-black dark:text-white">

      {/* Header Logo and Title */}
      <header className="flex flex-col items-center gap-6 mt-8">
        <div className="relative w-[180px] h-[180px]">
          <Image
            src="/dole-logo.png"
            alt="DOLE Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">
          PESO-MISOR EMPLOYMENT REPORT SYSTEM
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
          PESO-MISOR ERS
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Department of Labor and Employment
          </p>
        </div>
      </header>

      {/* Main Navigation */}
      <main className="flex flex-col gap-8 mt-12 items-center">
        <div className="flex flex-col gap-6 items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg hover:shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Login to System
            </Link>
            <Link
              href="/report"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg hover:shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Create Report
            </Link>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            About PESO-MISOR ERS
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          To implement an accessible, efficient, and accurate employment reporting system for all 26 Public Employment Service Offices (PESO) in Misamis Oriental. The system will provide real-time access for all users, ensure data accuracy through a standardized reporting format and uniform data entry fields, enable streamlined report tracking, and support the efficient generation of reports in prescribed formats.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-16 mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} Department of Labor and Employment. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
