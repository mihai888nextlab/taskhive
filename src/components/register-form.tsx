import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { FormEvent, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleLogin } from "@react-oauth/google";

export function RegisterForm({
  className,
  handleRegister,
  values,
  setValues,
  ...props
}: React.ComponentProps<"div"> & {
  handleRegister: (e: FormEvent<HTMLFormElement>) => void;
  values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  setValues: ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
}) {
  const { login, loadingUser, error } = useAuth();

  const handleGoogleSuccess = async (response: any) => {
    if (response) {
      console.log("Google ID Token:", response);
      // Apelează funcția de login din hook-ul tău custom useAuth, trimițând ID Token-ul
      await login("google", { code: response });
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <div
      className={cn(
        "flex max-h-fit items-center justify-center bg-[#18181b] px-2",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#18181b] shadow-xl py-2">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-white mb-1 mt-5">
            Create your account
          </CardTitle>
          <CardDescription className="text-gray-400 mb-2">
            <GoogleAuthButton
              onLoginSuccess={handleGoogleSuccess}
              onLoginFailure={handleGoogleError}
            />
            Register with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-500">or continue with</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-gray-300 mb-1 block text-sm"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={values.firstName}
                  onChange={(e) =>
                    setValues({ ...values, firstName: e.target.value })
                  }
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className="text-gray-300 mb-1 block text-sm"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={values.lastName}
                  onChange={(e) =>
                    setValues({ ...values, lastName: e.target.value })
                  }
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="family-name"
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-gray-300 mb-1 block text-sm"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={values.email}
                  onChange={(e) =>
                    setValues({ ...values, email: e.target.value })
                  }
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="text-gray-300 mb-1 block text-sm"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={(e) =>
                    setValues({ ...values, password: e.target.value })
                  }
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-300 mb-1 block text-sm"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  onChange={(e) =>
                    setValues({ ...values, confirmPassword: e.target.value })
                  }
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="w-full flex justify-center">
                  <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow mt-4 mb-2 max-w-md text-center flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2"
                disabled={loadingUser}
              >
                {loadingUser ? "Registering..." : "Register"}
              </Button>
            </div>
            <div className="text-center text-xs text-gray-400 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-blue-400 hover:underline">
                Login
              </a>
            </div>
          </form>
        </CardContent>
        <div className="px-6 pb-4 pt-2 text-center text-xs text-gray-500">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline hover:text-blue-400">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-blue-400">
            Privacy Policy
          </a>
          .
        </div>
      </Card>
    </div>
  );
}

interface GoogleAuthButtonProps {
  // You can pass a function to handle the successful response
  onLoginSuccess: (token: string) => void;
  onLoginFailure?: (error: any) => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onLoginSuccess,
  onLoginFailure,
}) => {
  // Use the useGoogleLogin hook
  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log("Google Login Success (Authorization Code):", codeResponse);
      // codeResponse.code is the authorization code you send to your backend
      onLoginSuccess(codeResponse.code);
    },
    onError: (errorResponse) => {
      console.error("Google Login Error:", errorResponse);
      if (onLoginFailure) {
        onLoginFailure(errorResponse);
      }
    },
    // Crucial: Use 'auth-code' flow for backend verification
    flow: "auth-code",
  });

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2 border-blue-600 text-blue-200 hover:bg-blue-600/10 hover:border-blue-500 transition mb-2"
      type="button"
      onClick={() => googleLogin()}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        <img
          src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
          alt="Google logo"
          width={20}
          height={20}
          style={{ display: "block" }}
          referrerPolicy="no-referrer"
        />
      </span>
      <span className="font-semibold">Register with Google</span>
    </Button>
  );
};
