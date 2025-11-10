import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "~/lib/auth.client";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  emailVerified: boolean;
  banned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Default context value to prevent errors during SSR/hydration
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAdmin: false,
  login: async () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: async () => {
    throw new Error("AuthProvider not initialized");
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted on client side to prevent SSR/hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch session on mount (only on client)
  useEffect(() => {
    if (!isMounted) return;

    const fetchSession = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          setUser(session.user as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [isMounted]);

  const isAdmin = user?.role === "admin";

  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (result.error) {
      throw new Error(result.error.message || "Login failed");
    }

    // If 2FA is required, the onTwoFactorRedirect callback will handle the redirect
    // and this code won't execute further
    
    // If we reach here, no 2FA is required - fetch session
    const { data: session } = await authClient.getSession();
    if (session?.user) {
      const userData = session.user as User;
      
      // Check if user is banned
      if (userData.banned) {
        // Sign out the banned user
        await authClient.signOut();
        throw new Error("Your account has been banned. Please contact support for assistance.");
      }
      
      setUser(userData);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Context is always defined now (has default value), but we can still check if it's the default
  // This prevents errors during SSR/hydration when components might render before AuthProvider is ready
  return context;
}
