import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center p-6 sm:p-12 font-[var(--font-geist-sans)] bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
      
      {/* Header Logo */}
      <header className="flex flex-col items-center gap-4 mt-8">
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={38}
          className="dark:invert"
        />
        <p className="text-sm text-center sm:text-base">
          Welcome to your Next.js App
        </p>
      </header>

      {/* Navigation Buttons */}
      <main className="flex flex-col gap-6 mt-10 items-center sm:items-start">
        <h2 className="text-xl font-semibold">Navigate to:</h2>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {[
            { href: "/login", label: "Login" },
            { href: "/admin", label: "Admin" },
            { href: "/user", label: "User" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/report", label: "Report" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm sm:text-base"
            >
              {label}
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-16 mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Created with ❤️ using{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
          >
            Next.js
          </a>{" "}
          and deployed on{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-black dark:hover:text-white"
          >
            Vercel
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
