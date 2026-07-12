import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, registerRequest, meRequest } from "../services/authService";
import { apiErrorMessage } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("devpms:user");
    return raw ? JSON.parse(raw) : null;
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("devpms:token");
    if (!token) {
      setInitializing(false);
      return;
    }
    meRequest()
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem("devpms:user", JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem("devpms:token");
        localStorage.removeItem("devpms:user");
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const persistSession = (nextUser, token) => {
    localStorage.setItem("devpms:token", token);
    localStorage.setItem("devpms:user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = useCallback(async (email, password) => {
    try {
      const { user: loggedInUser, token } = await loginRequest({ email, password });
      persistSession(loggedInUser, token);
      return loggedInUser;
    } catch (err) {
      throw new Error(apiErrorMessage(err));
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    try {
      const { user: newUser, token } = await registerRequest({ name, email, password, role });
      persistSession(newUser, token);
      return newUser;
    } catch (err) {
      throw new Error(apiErrorMessage(err));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("devpms:token");
    localStorage.removeItem("devpms:user");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), initializing, login, register, logout }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
