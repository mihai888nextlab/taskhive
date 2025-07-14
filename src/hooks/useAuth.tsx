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
  hasCompany: boolean; // O nouă proprietate utilă pentru a verifica dacă utilizatorul are o companie
  refetchUser: () => Promise<void>; // Funcție pentru a re-fetch-ui manual
  login: (
    provider: string,
    credentials: { email?: string; password?: string; idToken?: string }
  ) => Promise<boolean>; // Adaugă funcție de login
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyName: string,
    vatNumber?: string
  ) => Promise<boolean>; // Adaugă funcție de register
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
    async (
      provider: string,
      credentials: { email?: string; password?: string; idToken?: string }
    ): Promise<boolean> => {
      setLoadingUser(true);
      setError(null);
      try {
        let res;
        if (provider == "google" && credentials.idToken) {
          res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: credentials.idToken,
            }),
          });
        } else if (
          provider == "credentials" &&
          credentials.email &&
          credentials.password
        ) {
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
          router.push("/app");
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
      firstName: string,
      lastName: string,
      companyName: string,
      vatNumber?: string
    ): Promise<boolean> => {
      setLoadingUser(true);
      setError(null);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            companyName,
            companyRegistrationNumber: vatNumber,
          }),
        });

        if (response.ok) {
          await fetchUserData();
          router.push("/app");
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
  const hasCompany = user?.companyId ? true : false; // Verifică dacă utilizatorul are o companie

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
