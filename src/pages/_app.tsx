import Loading from "@/components/Loading";
import "@/styles/globals.css";
import { AppPropsWithLayout } from "@/types";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Define the User interface with the role property
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // Add the role property here
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loadingUser: boolean;
  isDashboardRoute: boolean;
}

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
            setUser({
              ...userData.user,
              createdAt: new Date(userData.user.createdAt),
              updatedAt: new Date(userData.user.updatedAt),
            } as User); // Cast the user data to the User type
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeOut", // Or "easeInOut", "anticipate"
    duration: 0.3, // A shorter duration for snappier dashboard navigation
  };

  const getLayout = Component.getLayout || ((page) => page);
  let content = getLayout(<Component {...pageProps} />);

  if (isDashboardRoute) {
    content = (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.pathname}
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={pageTransition}
          style={{ position: "relative" }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );

    // Show loading spinner for dashboard routes if user data is not ready
    if (loadingUser && user === null && !router.pathname.startsWith("/auth")) {
      return <p>Loading dashboard...</p>;
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loadingUser, isDashboardRoute }}
    >
      <Head>
        <link rel="icon" href="favicon.ico" />
        <title>Taskhive</title>
        <meta name="description" content="A employee management application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {content}
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