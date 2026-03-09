"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, tokenStore, clinicIdStore } from "@/lib/api";
import type { AuthUser } from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  clinicId: string | null;
  isLoading: boolean;
  login: (idToken: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate stored token
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.auth
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (idToken: string): Promise<AuthUser> => {
    const { accessToken, user } = await api.auth.googleVerify({ idToken });
    tokenStore.set(accessToken);
    if (user.clinicId) clinicIdStore.set(user.clinicId);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    clinicIdStore.clear();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, clinicId: user?.clinicId ?? null, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
