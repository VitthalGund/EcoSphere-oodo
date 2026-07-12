import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { UserProfile, UserRole } from "../../lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAdmin: boolean;
  isDepartmentHead: boolean;
  isEmployee: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        await fetchProfile(currentUser.id);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error && (email === 'priya@ecosphere.com' || email === 'meera@ecosphere.com' || email === 'raj@ecosphere.com')) {
        let role = 'employee';
        let name = 'Raj';
        let department_id = 'd4444444-4444-4444-4444-444444444444'; // Operations

        if (email === 'priya@ecosphere.com') {
          role = 'admin';
          name = 'Priya';
          department_id = 'd1111111-1111-1111-1111-111111111111'; // IT
        } else if (email === 'meera@ecosphere.com') {
          role = 'department_head';
          name = 'Meera';
          department_id = 'd2222222-2222-2222-2222-222222222222'; // Sales
        }

        console.log("Demo user not found in Auth. Auto-registering...", email);
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              name,
              department_id
            }
          }
        });

        if (!signUpRes.error) {
          const retryRes = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          return { error: retryRes.error };
        } else {
          return { error: signUpRes.error };
        }
      }

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const isAdmin = profile?.role === "admin";
  const isDepartmentHead = profile?.role === "department_head";
  const isEmployee = profile?.role === "employee";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut,
        isAdmin,
        isDepartmentHead,
        isEmployee,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
