export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loadingUser: boolean;
  isDashboardRoute: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  password: string;
  role: string;
  companyId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
}

import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { AppProps } from "next/app";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
