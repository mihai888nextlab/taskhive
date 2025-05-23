import Loading from "@/components/Loading";
import "@/styles/globals.css";
import { AppPropsWithLayout, AuthContextType, User } from "@/types";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isDashboardRoute = router.pathname.startsWith("/app");

  useEffect(() => {
    if (isDashboardRoute && user === null) {
      const fetchUserData = async () => {
        try {
          setLoadingUser(true);
          const res = await fetch("/api/user");
          if (res.ok) {
            const userData = await res.json();
            setUser(userData.user);
          } else if (res.status === 401) {
            setUser(null);
            if (
              isDashboardRoute &&
              !(
                router.pathname.startsWith("/register") ||
                router.pathname.startsWith("/login")
              )
            ) {
              router.push("/login");
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser(null);
          if (
            isDashboardRoute &&
            !(
              router.pathname.startsWith("/register") ||
              router.pathname.startsWith("/login")
            )
          ) {
            router.push("/login");
          }
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUserData();
    } else if (!isDashboardRoute && !loadingUser) {
      setLoadingUser(true);
      setUser(null);
    }
  }, [router.pathname, isDashboardRoute, user]);

  if (isDashboardRoute && loadingUser && user === null) {
    if (
      !router.pathname.startsWith("/login") &&
      !router.pathname.startsWith("/register")
    ) {
      return <Loading />;
    }
  }

  const getLayout = Component.getLayout || ((page) => page);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loadingUser, isDashboardRoute }}
    >
      <Head>
        <title>Taskhive</title>
        <meta name="description" content="A employee management application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isDashboardRoute
        ? user || router.pathname.startsWith("/auth")
          ? getLayout(<Component {...pageProps} />)
          : null
        : getLayout(<Component {...pageProps} />)}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthContext.Provider");
  }
  return context;
};
