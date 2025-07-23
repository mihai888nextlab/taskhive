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
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";

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
  const { login, loadingUser, error } = useAuth();

  const handleGoogleSuccess = async (response: any) => {
    if (response) {
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
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-400 mb-2">
            <GoogleAuthButton
              onLoginSuccess={handleGoogleSuccess}
              onLoginFailure={handleGoogleError}
            />
            Login with your Google account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
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
                  <a href="#" className="text-xs text-blue-400 hover:underline">
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
                {loadingUser ? "Logging in..." : "Login"}
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

interface GoogleAuthButtonProps {
  // You can pass a function to handle the successful response
  onLoginSuccess: (token: string) => void;
  onLoginFailure?: (error: any) => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onLoginSuccess,
  onLoginFailure,
}) => {
  const router = useRouter(); // For redirecting after login (optional)

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
    redirect_uri: `https://www.taskhive.tech/`, // Ensure this matches your backend endpoint
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
      <span className="font-semibold">Login with Google</span>
    </Button>
  );
};
