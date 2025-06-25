import "@/styles/globals.css";
import { AppPropsWithLayout } from "@/types";
import Head from "next/head";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";

import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const isDashboardRoute = router.pathname.startsWith("/app");

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "easeOut" as const,
    duration: 0.3,
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
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Head>
          <link rel="icon" href="favicon.ico" />
          <title>Taskhive</title>
          <meta
            name="description"
            content="A employee management application"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {content}
        <SpeedInsights />
      </AuthProvider>
    </ThemeProvider>
  );
}
