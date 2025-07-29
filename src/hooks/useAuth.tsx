import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loadingUser: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasCompany: boolean;
  refetchUser: () => Promise<void>;
  login: (
    provider: string,
    credentials: { email?: string; password?: string; code?: string }
  ) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    setLoadingUser(true);
    setError(null);
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUser({
          ...data.user,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt),
        } as User);
      } else {
        setUser(null);
        
      }
    } catch (err: unknown) {
      console.error("Error fetching user data in AuthProvider:", err);
      setUser(null);
      
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const login = useCallback(
    async (
      provider: string,
      credentials: { email?: string; password?: string; code?: string }
    ): Promise<boolean> => {
      setLoadingUser(true);
      setError(null);
      try {
        let res;
        setLoadingUser(true);
        if (provider == "google" && credentials.code) {
          res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: credentials.code,
            }),
          });
        } else if (
          provider == "credentials" &&
          credentials.email &&
          credentials.password
        ) {
          if (!credentials.email || !credentials.password) {
            setError("Email and password are required.");
            setUser(null);
            setLoadingUser(false);
            return false;
          }

          res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
        } else {
          throw new Error("Invalid provider or missing credentials");
        }

        if (res.ok) {
          await fetchUserData();
          router.push("/app/select-company");
          return true;
        } else {
          const errData = await res.json();
          setError(
            errData.message || "Login failed. Please check your credentials."
          );
          setUser(null);
          return false;
        }
      } catch (err: unknown) {
        console.error("Error during login:", err);
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: string }).message)
            : "An unexpected error occurred during login."
        );
        setUser(null);
        return false;
      } finally {
        setLoadingUser(false);
      }
    },
    [fetchUserData, router]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      confirmPassword: string,
      firstName: string,
      lastName: string
    ): Promise<boolean> => {
      setLoadingUser(true);
      setError(null);

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setUser(null);
        setLoadingUser(false);
        return false;
      }

      if (!email || !password || !firstName || !lastName) {
        setError("All fields are required.");
        setUser(null);
        setLoadingUser(false);
        return false;
      }

      try {
        setLoadingUser(true);
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
          }),
        });

        if (response.ok) {
          await fetchUserData();
          router.push("/app/select-company");
          return true;
        } else {
          const errData = await response.json();
          setError(
            errData.message || "Registration failed. Please try again later."
          );
          setUser(null);
          return false;
        }
      } catch (err: unknown) {
        console.error("Error during registration:", err);
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: string }).message)
            : "An unexpected error occurred during registration."
        );
        setUser(null);
        return false;
      } finally {
        setLoadingUser(false);
      }
    },
    [fetchUserData, router]
  );

  const logout = useCallback(
    async (redirectUrl: string = "/login") => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (err) {
        console.error("Error during logout API call:", err);
      } finally {
        setUser(null);
        router.push(redirectUrl);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const isAuthenticated = user !== null;
  const hasCompany = user?.companyId ? true : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingUser,
        error,
        isAuthenticated,
        hasCompany,
        refetchUser: fetchUserData,
        login,
        register,
        logout,
      }}
    >
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
