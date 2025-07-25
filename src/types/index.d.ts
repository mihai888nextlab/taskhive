export interface User {
  companyId: any;
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage?: { data?: string } | string | null;
  description?: string;
  skills?: string[];
  companyId?: string;
  companyName?: string;
  companies?: { id: string; name: string; role: string }[];
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
  role?: string;
  departmentId?: string;
}

import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { AppProps } from "next/app";

export type NextPageWithLayout<P = Record<string, never>, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type TableDataItem = {
  id: string | number; // Fiecare rând ar trebui să aibă un ID unic
  [key: string]: unknown; // Permite orice alte proprietăți
};

export type TableColumn<T extends TableDataItem> = {
  key: keyof T | "actions";
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
};

export type TableAction<T extends TableDataItem> = {
  label: string; // Textul butonului
  onClick: (item: T) => void; // Funcția care se execută la click
  className?: string; // Clase Tailwind suplimentare pentru stilizare
};
