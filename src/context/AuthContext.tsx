import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type AuthUser } from "../services/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "chartstudio_token";
const USER_KEY = "chartstudio_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  const persist = (persistedUser: AuthUser, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(persistedUser));
    setUser(persistedUser);
  };

  const clear = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const signup = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { user: newUser, accessToken } = await authApi.signup({
        fullName,
        email,
        password,
      });
      persist(newUser, accessToken);
    },
    [],
  );

  const signin = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, accessToken } = await authApi.signin({
      email,
      password,
    });
    persist(loggedInUser, accessToken);
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await authApi.logout(token).catch(() => {});
    }
    clear();
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, signup, signin, logout }),
    [user, signup, signin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  // create isAuthenticated
  const isAuthenticated = !!ctx.user;
  return { ...ctx, isAuthenticated };
};
