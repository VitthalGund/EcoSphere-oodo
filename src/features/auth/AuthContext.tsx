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

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        
        // Self-heal: If profile doesn't exist, try creating it from auth metadata
        if (error.code === 'PGRST116') {
          console.log("Profile not found. Attempting to self-heal and create profile...");
          let deptId = currentUser.user_metadata?.department_id;
          if (!deptId || deptId.trim() === '') deptId = null;

          const { data: newData, error: insertErr } = await supabase
            .from('users')
            .insert({
              id: currentUser.id,
              email: currentUser.email || '',
              name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
              role: currentUser.user_metadata?.role || 'employee',
              department_id: deptId,
              xp: 0,
              level: 1,
              points_balance: 0,
              avatar_url: currentUser.user_metadata?.avatar_url || null
            })
            .select()
            .single();
            
          if (!insertErr && newData) {
            console.log("Profile successfully recovered!");
            setProfile(newData as UserProfile);
            return;
          } else {
             console.error("Failed to self-heal profile:", insertErr);
          }
        }
        
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
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser).finally(() => setLoading(false));
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
        await fetchProfile(currentUser);
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
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
