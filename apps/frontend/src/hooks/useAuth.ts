import { useMemo, useState } from "react";
import { api } from "../services/api";

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));

  return useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      async login(username: string, password: string) {
        const response = await api.post<{ token: string }>("/api/auth/login", { username, password });
        localStorage.setItem("adminToken", response.data.token);
        setToken(response.data.token);
      },
      logout() {
        localStorage.removeItem("adminToken");
        setToken(null);
      }
    }),
    [token]
  );
}
