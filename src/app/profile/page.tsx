"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center text-red-600">
        <p>Please log in to view your profile.</p>
        <button 
          onClick={() => router.push("/login")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-6">Profile Information</h1>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">User ID</p>
          <p className="text-lg">{user.id}</p>
        </div>
        <div className="border-b pb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Email</p>
          <p className="text-lg">{user.email}</p>
        </div>
        <div className="border-b pb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Role</p>
          <p className="text-lg capitalize">{user.role}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Access Information</h2>
          <ul className="space-y-2 text-sm">
            {user.role === 'admin' ? (
              <>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Full administrative access
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Can manage users and reports
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Can view all dashboard data
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Standard user access
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Can view and create reports
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Can view personal dashboard
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
} 