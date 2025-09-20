"use client";

import type { AppUser } from "@/lib/types";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: AppUser;
  login: (email: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState(true);

  // Simulate initial auth check
  React.useEffect(() => {
    setTimeout(() => {
        setLoading(false);
    }, 1000);
  }, []);

  const login = (email: string) => {
    setLoading(true);
    setTimeout(() => {
      setUser({
        uid: "mock-uid-123",
        email: email,
        displayName: "John Doe",
        addresses: [],
        orders: [],
      });
      setLoading(false);
    }, 500);
  };

  const logout = () => {
    setLoading(true);
    setTimeout(() => {
        setUser(null);
        setLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
