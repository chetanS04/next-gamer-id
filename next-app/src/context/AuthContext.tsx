"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUser, logout as apiLogout } from "../../utils/auth";
import { User } from "@/common/interface";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  setUserDirectly: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    try {
      const response = await getUser();
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const setUserDirectly = (user: User) => {
    setUser(user);
    setLoading(false);
  };

  useEffect(() => {
    refetchUser(); // initial load
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refetchUser, setUserDirectly }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
