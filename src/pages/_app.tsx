import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { TimeTrackingProvider } from "@/components/time-tracking/TimeTrackingContext";
import { AIWindowProvider } from "@/contexts/AIWindowContext";
import { IntlProvider } from "next-intl";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

// Import all messages
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
import { SpeedInsights } from "@vercel/speed-insights/next";

// Type for pages with custom layout
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
  return (
    <LanguageProvider>
      <LanguageConsumerApp Component={Component} pageProps={pageProps} router={router} />
    </LanguageProvider>
  );
}

function LanguageConsumerApp({ Component, pageProps, router }: AppPropsWithLayout) {
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
  };
  const messages = messagesMap[lang] || enMessages;

  // Pass locale to pageProps for layouts/pages that need it
  const mergedPageProps = { ...pageProps, locale: lang };

  // Support for per-page layouts
  const getLayout =
    Component.getLayout ||
    ((page: ReactElement) => <DashboardLayout locale={lang}>{page}</DashboardLayout>);

  const content = getLayout(<Component {...mergedPageProps} />);

  return (
    <IntlProvider locale={lang} messages={messages}>
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
    </IntlProvider>
  );
}