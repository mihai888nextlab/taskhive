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

export const RegisterForm: React.FC<
  React.ComponentProps<"div"> & { googleClientId?: string }
> = React.memo(function RegisterForm({
  className,
  googleClientId,
  ...props
}) {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize register handler
  const handleRegister = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      // Basic client-side validation
      if (
        !values.email ||
        !values.password ||
        !values.firstName ||
        !values.lastName
      ) {
        setError("All required fields must be filled.");
        setLoading(false);
        return;
      }

      if (values.password !== values.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            companyName: "Default Company",
            companyRegistrationNumber: "",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(
            data.message || "Registration failed. Please check your details."
          );
          setLoading(false);
          return;
        }

        // Registration successful, redirect or show success
        window.location.href = "/app";
      } catch (err) {
        setError("An error occurred during registration.");
        setLoading(false);
      }
    },
    [values]
  );

  // Memoize Google register handler
  const handleGoogleRegister = useCallback(async () => {
    // @ts-ignore
    if (window.google && window.google.accounts) {
      // @ts-ignore
      window.google.accounts.id.prompt();
    }
  }, []);

  // Memoize input change handlers
  const handleInputChange = useCallback(
    (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [field]: e.target.value });
    },
    [values]
  );

  useEffect(() => {
    // Load Google Identity Services script
    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            // Send token to backend
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ googleToken: response.credential }),
            });
            const data = await res.json();
            if (res.ok) {
              window.location.href = "/app";
            } else {
              alert(data.message || "Google registration failed.");
            }
          },
        });
      };
      document.body.appendChild(script);
    }
  }, [googleClientId]);

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
            Register with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-blue-600 text-blue-200 hover:bg-blue-600/10 hover:border-blue-500 transition mb-2"
              type="button"
              onClick={handleGoogleRegister}
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
                  onChange={handleInputChange("firstName")}
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
                  onChange={handleInputChange("lastName")}
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
                  onChange={handleInputChange("email")}
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
                  onChange={handleInputChange("password")}
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
                  onChange={handleInputChange("confirmPassword")}
                  required
                  className="bg-[#23272f] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="text-red-500 text-xs text-center bg-transparent py-1">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
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
});