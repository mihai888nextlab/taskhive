import "@/styles/globals.css";
import { AppPropsWithLayout } from "@/types";
import Head from "next/head";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { TimeTrackingProvider } from "@/components/time-tracking/TimeTrackingContext";
import { AIWindowProvider } from "@/contexts/AIWindowContext";

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

  return (
    <ThemeProvider>
      <AuthProvider>
        <TimeTrackingProvider>
          <AIWindowProvider>
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
          </AIWindowProvider>
        </TimeTrackingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
