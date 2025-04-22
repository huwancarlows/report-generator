"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Simulating fetching user data from a session or some external state
    const fetchUser = async () => {
      try {
        // Simulate fetching user from the database or local storage (no auth)
        const userData = JSON.parse(localStorage.getItem("user") || "{}");

        if (!userData || !userData.email) {
          setError("User not logged in.");
          router.push("/login"); // Redirect to login if not logged in
          return;
        }

        // Simulating fetching user profile from profiles table
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("email, role")
          .eq("email", userData.email)
          .single();

        if (fetchError) {
          setError("Error fetching user data.");
          return;
        }

        if (data) {
          setUser(data); // Set the fetched user data to the state
        }
      } catch (error) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#111] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Welcome to Your User Dashboard
        </h2>

        <div className="mb-6">
          <p className="text-gray-900 dark:text-white">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-gray-900 dark:text-white">
            <strong>Role:</strong> {user.role || "User role not assigned"}
          </p>
        </div>

        <div className="text-center">
          <button
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            onClick={() => {
              // Clear user data (or perform logout action)
              localStorage.removeItem("user");
              router.push("/login"); // Redirect to login page
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
