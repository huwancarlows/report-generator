"use client";

export default function Header() {
  return (
    <header className="w-full h-16 bg-white shadow px-6 flex items-center justify-between fixed top-0 left-64 z-10">
      <h1 className="text-lg font-semibold">Welcome, Admin</h1>
      {/* Add profile icon or logout button here */}
    </header>
  );
}
