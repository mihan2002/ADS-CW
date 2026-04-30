import * as React from "react";
import { clearTokens, getAccessToken, setTokens } from "../utils/tokenStorage";
import { login as loginApi, verifyAccessToken } from "../services/api/auth";
import { clearAuthData } from "../services/api/client";
import { isDevBypassEnabled, setDevBypassEnabled } from "../utils/devMode";

export interface AuthSessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthSessionUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  setUser: (user: AuthSessionUser | null) => void;
  devSignIn: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signOut: () => { },
  setUser: () => { },
  devSignIn: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthSessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const bootstrapAuth = React.useCallback(async () => {
    if (isDevBypassEnabled()) {
      setUser({
        id: 999999,
        name: "Dev User",
        email: "dev@university.local",
        role: "admin",
      });
      setLoading(false);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const verified = await verifyAccessToken();
      setUser({
        id: verified.userId,
        name: verified.name,
        email: verified.email,
        role: verified.role,
      });
    } catch {
      clearAuthData();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    const payload = await loginApi(email, password);
    setDevBypassEnabled(false);
    setTokens(payload.accessToken, payload.refreshToken);
    setUser({
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      role: payload.user.role,
    });
  }, []);

  const signOut = React.useCallback(() => {
    setDevBypassEnabled(false);
    clearAuthData();
    setUser(null);
  }, []);

  const devSignIn = React.useCallback(() => {
    setDevBypassEnabled(true);
    setUser({
      id: 999999,
      name: "Dev User",
      email: "dev@university.local",
      role: "admin",
    });
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      setUser,
      devSignIn,
    }),
    [user, loading, signIn, signOut, devSignIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
