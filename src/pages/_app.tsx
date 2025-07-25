import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import Head from "next/head";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { TimeTrackingProvider } from "@/components/time-tracking/TimeTrackingContext";
import { AIWindowProvider } from "@/contexts/AIWindowContext";
import { IntlProvider } from "next-intl";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Import all messages
import jaMessages from "../../messages/ja.json";
import koMessages from "../../messages/ko.json";
import enMessages from "../../messages/en.json";
import frMessages from "../../messages/fr.json";
import esMessages from "../../messages/es.json";
import ptMessages from "../../messages/pt.json";
import roMessages from "../../messages/ro.json";
import srMessages from "../../messages/sr.json";
import zhMessages from "../../messages/zh.json";
import hiMessages from "../../messages/hi.json";
import arMessages from "../../messages/ar.json";
import grMessages from "../../messages/gr.json";
import deMessages from "../../messages/de.json";
import daMessages from "../../messages/da.json";
import itMessages from "../../messages/it.json";
import ruMessages from "../../messages/ru.json";
import noMessages from "../../messages/no.json";
import svMessages from "../../messages/sv.json";
import fiMessages from "../../messages/fi.json";
import nlMessages from "../../messages/nl.json";
import huMessages from "../../messages/hu.json";
import trMessages from "../../messages/tr.json";
import viMessages from "../../messages/vi.json";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Type for pages with custom layout
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({
  Component,
  pageProps,
  router,
}: AppPropsWithLayout) {
  return (
    <LanguageProvider>
      <LanguageConsumerApp
        Component={Component}
        pageProps={pageProps}
        router={router}
      />
    </LanguageProvider>
  );
}

function LanguageConsumerApp({
  Component,
  pageProps,
  router,
}: AppPropsWithLayout) {
  const { lang } = useLanguage();

  const messagesMap: Record<string, any> = {
    en: enMessages,
    fr: frMessages,
    es: esMessages,
    pt: ptMessages,
    ro: roMessages,
    sr: srMessages,
    zh: zhMessages,
    hi: hiMessages,
    ar: arMessages,
    gr: grMessages,
    de: deMessages,
    da: daMessages,
    it: itMessages,
    ru: ruMessages,
    no: noMessages,
    sv: svMessages,
    fi: fiMessages,
    nl: nlMessages,
    hu: huMessages,
    tr: trMessages,
    ja: jaMessages,
    ko: koMessages,
    vi: viMessages,
  };
  const messages = messagesMap[lang] || enMessages;

  // Pass locale to pageProps for layouts/pages that need it
  const mergedPageProps = { ...pageProps, locale: lang };

  // Detect if the route is under /app (authenticated area)
  const isAppRoute =
    typeof window !== "undefined"
      ? window.location.pathname.startsWith("/app")
      : (pageProps?.router?.pathname || "").startsWith("/app");

  // Use getLayout if defined, else use DashboardLayout for /app/*, else render page directly
  const getLayout =
    Component.getLayout ||
    ((page: ReactElement) =>
      isAppRoute ? (
        <DashboardLayout locale={lang}>{page}</DashboardLayout>
      ) : (
        page
      ));

  const content = getLayout(<Component {...mergedPageProps} />);

  return (
    <IntlProvider locale={lang} messages={messages}>
      <ThemeProvider>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
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
        </GoogleOAuthProvider>
      </ThemeProvider>
    </IntlProvider>
  );
}
