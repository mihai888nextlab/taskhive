import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import { useRouter } from "next/router"; // Pentru redirecționare
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loadingUser: boolean;
  error: string | null;
  isAuthenticated: boolean; // O nouă proprietate utilă
  refetchUser: () => Promise<void>; // Funcție pentru a re-fetch-ui manual
  login: (email: string, password: string) => Promise<boolean>; // Adaugă funcție de login
  logout: () => void; // Adaugă funcție de logout
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
      //setError(err.message || 'Failed to load user data.');
    } finally {
      setLoadingUser(false);
    }
  }, []); // Dependențe goale, deoarece nu se bazează pe props sau state din acest scope

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoadingUser(true);
      setError(null);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          await fetchUserData();
          router.push("/dashboard");
          return true;
        } else {
          const errData = await response.json();
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

  const logout = useCallback(
    async (redirectUrl: string = "/login") => {
      try {
        await fetch("/api/auth/logout", { method: "POST" }); // Ajustează acest endpoint!
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
  }, [fetchUserData]); // Rulează o singură dată la montare

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingUser,
        error,
        isAuthenticated,
        refetchUser: fetchUserData,
        login,
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
