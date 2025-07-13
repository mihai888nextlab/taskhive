import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaUserPlus, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";
import { Button } from "@/components/ui/button";

import type { NextPage } from "next";
import type { ReactElement } from "react";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement;
};

const InvitePage: NextPageWithLayout = () => {
  const auth = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const memoizedTheme = useMemo(() => theme, [theme]);
  const { id: inviteId } = router.query;
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleAcceptInvite = useCallback(async () => {
    setStatus("idle");
    setMessage("");
    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setStatus("error");
        setMessage(errorText || "Failed to accept invite.");
        return;
      }

      const data = await response.json();
      setStatus("success");
      setMessage("Invitation accepted! You have joined the company.");
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/app");
      }, 1800);
    } catch (error) {
      setStatus("error");
      setMessage("Error accepting invite.");
    }
  }, [inviteId, router]);

  if (!auth.isAuthenticated) {
    return (
      <AccessDenied theme={memoizedTheme} />
    );
  }

  return (
    <InviteContent
      status={status}
      message={message}
      theme={memoizedTheme}
      handleAcceptInvite={handleAcceptInvite}
    />
  );
};

const AccessDenied = React.memo(function AccessDenied({ theme }: { theme: string }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className={`bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
        <h1 className="text-2xl font-bold mb-2 text-red-600 flex items-center gap-2">
          <FaTimesCircle className="text-xl" /> Access Denied
        </h1>
        <p className="mb-4 text-gray-600">You must be logged in to access this page.</p>
        <Link href="/login" className="inline-block">
          <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all">
            Redirect to Login
          </Button>
        </Link>
      </div>
    </div>
  );
});

const InviteContent = React.memo(function InviteContent({
  status,
  message,
  theme,
  handleAcceptInvite,
}: {
  status: "idle" | "success" | "error";
  message: string;
  theme: string;
  handleAcceptInvite: () => void;
}) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} p-8 flex flex-col items-center`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <FaUserPlus className="text-xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Invitation</h1>
            <p className="text-gray-600">You have been invited to join a company.</p>
          </div>
        </div>
        {status === "success" && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2 font-medium">
            <FaCheckCircle /> {message}
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 font-medium">
            <FaTimesCircle /> {message}
          </div>
        )}
        <Button
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2"
          onClick={handleAcceptInvite}
          disabled={status === "success"}
        >
          <FaUserPlus className="mr-2" />
          Accept Invitation
        </Button>
        <p className="mt-6 text-xs text-gray-400 text-center">
          If you have issues accepting the invite, please contact your administrator.
        </p>
      </div>
    </div>
  );
});

export default InvitePage;
