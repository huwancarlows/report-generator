"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

// User profile type (from 'profiles' table)
type UserProfile = {
  id: string;
  role: 'admin' | 'user';
  name: string;
  municipal_mayor: string;
  address: string;
};

type AuthContextType = {
  user: UserProfile | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => { },
  logout: async () => false,
  refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile from 'profiles' table
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return data as UserProfile;
  };

  // Refresh user profile and update context
  const refreshUser = async () => {
    if (!user) return;
    const updatedProfile = await fetchProfile(user.id);
    if (updatedProfile) {
      setUser(updatedProfile);
      setRole(updatedProfile.role);
    }
  };

  // On mount, check for active session
  useEffect(() => {
    const getSessionAndProfile = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setRole(profile.role);
          } else {
            setUser(null);
            setRole(null);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        setUser(null);
        setRole(null);
        console.error("Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };
    getSessionAndProfile();
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setRole(null);
      } else if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          if (profile) {
            setUser(profile);
            setRole(profile.role);
          } else {
            setUser(null);
            setRole(null);
          }
        });
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    // Do NOT setLoading here; let the login page handle its own loading state
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message || "Login failed");
    const profile = await fetchProfile(data.user.id);
    if (!profile) throw new Error("Profile not found");
    setUser(profile);
    setRole(profile.role);
    // Wait for state to update before returning
    await new Promise(resolve => setTimeout(resolve, 0));
  };


  // Logout function
  const logout = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase logout error:", error);
        return false;
      }
      localStorage.removeItem("user");
      // Force a hard reload to /login to guarantee state reset
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return true;
    } catch (error) {
      console.error("Unexpected logout error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
