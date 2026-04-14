import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const currentUser = await authService.me();
        setUser(currentUser);
      } catch (_error) {
        localStorage.removeItem("auth_token");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    bootstrapAuth();
  }, []);

  const login = async (payload) => {
    setAuthError("");
    const result = await authService.login(payload);
    localStorage.setItem("auth_token", result.token);
    setUser(result.user);
  };

  const signup = async (payload) => {
    setAuthError("");
    const result = await authService.signup(payload);
    localStorage.setItem("auth_token", result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const forgotPassword = async (email) => {
    setAuthError("");
    return authService.forgotPassword(email);
  };

  const resetPassword = async (payload) => {
    setAuthError("");
    await authService.resetPassword(payload);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingAuth,
      authError,
      setAuthError,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword
    }),
    [user, isCheckingAuth, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
