"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

type User = { id: string; email: string };
type AuthState = { user: User | null; token: string | null };

type AuthCtx = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "flowlite_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // ✅ browser-only read
  useEffect(() => {
    try {
      const t = window.localStorage.getItem(STORAGE_KEY);
      if (t) setToken(t);
    } catch {
      // ignore
    }
  }, []);

  const saveToken = (t: string) => {
    window.localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    saveToken(data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: { email, password },
      },
    );
    saveToken(data.token);
    setUser(data.user);
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
