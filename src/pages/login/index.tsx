import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

export default function Login() {
  const router = useRouter();
  const auth = useAuth();

  const [values, setValues] = useState({
    userEmail: "",
    userPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!values.userEmail || !values.userPassword) {
      setError("Both fields are required.");
      setLoading(false);
      return;
    }

    try {
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     email: values.userEmail,
      //     password: values.userPassword,
      //   }),
      // });

      // const data = await response.json();

      // if (response.ok) {
      //   // Redirect to dashboard or home page
      //   router.push("/app");
      // } else {
      //   setError(data.message || "Login failed.");
      // }

      const res = await auth.login(values.userEmail, values.userPassword);
      if (!res) {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during login.");
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-screen flex flex-col items-center">
      <Header />
      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center px-2 sm:px-4 py-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl text-white font-bold mb-6 text-center">
            Login
          </h1>
          <form className="space-y-6" onSubmit={handleLogin}>
            <FloatingLabelInput
              id="email"
              label="Email Address"
              type="email"
              name="userEmail"
              required
              autoComplete="email"
              onChange={(e) =>
                setValues({ ...values, userEmail: e.target.value })
              }
              value={values.userEmail}
            />
            <FloatingLabelInput
              id="password"
              label="Password"
              type="password"
              name="userPassword"
              required
              autoComplete="current-password"
              onChange={(e) =>
                setValues({ ...values, userPassword: e.target.value })
              }
              value={values.userPassword}
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-base sm:text-lg"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
