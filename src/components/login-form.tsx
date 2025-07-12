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
import { FormEvent, useEffect } from "react";

// Extend the Window interface to include 'google'
declare global {
  interface Window {
    google?: any;
  }
}

export function LoginForm({
  className,
  handleLogin,
  values,
  setValues,
  ...props
}: React.ComponentProps<"div"> & {
  handleLogin: (e: FormEvent<HTMLFormElement>) => void;
  values: {
    userEmail: string;
    userPassword: string;
  };
  setValues: ({
    userEmail,
    userPassword,
  }: {
    userEmail: string;
    userPassword: string;
  }) => void;
}) {
  const handleGoogleLogin = async () => {
    // @ts-ignore
    if (window.google && window.google.accounts) {
      // @ts-ignore
      window.google.accounts.id.prompt();
    }
  };

  useEffect(() => {
    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            // Send token to backend
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ googleToken: response.credential }),
            });
            const data = await res.json();
            if (res.ok) {
              window.location.href = "/app";
            } else {
              alert(data.message || "Google login failed.");
            }
          },
        });
      };
      document.body.appendChild(script);
    }
  }, []);

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
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-400 mb-2">
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-blue-600 text-blue-200 hover:bg-blue-600/10 hover:border-blue-500 transition mb-2"
              type="button"
              onClick={handleGoogleLogin}
            >
              {/* Use Google logo from a reliable CDN */}
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
              <span className="font-semibold">Login with Google</span>
            </Button>
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-500">or continue with</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <div className="space-y-4">
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
                  value={values.userEmail}
                  onChange={(e) =>
                    setValues({ ...values, userEmail: e.target.value })
                  }
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password" className="text-gray-300 text-sm">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={values.userPassword}
                  onChange={(e) =>
                    setValues({ ...values, userPassword: e.target.value })
                  }
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2"
              >
                Login
              </Button>
            </div>
            <div className="text-center text-xs text-gray-400 mt-4">
              Don&apos;t have an account?{" "}
              <a href="#" className="text-blue-400 hover:underline">
                Sign up
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