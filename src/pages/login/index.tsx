import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
    <div className="min-w-full min-h-screen flex flex-col items-center bg-background relative overflow-hidden">
      {/* Subtle background pattern/image for theme */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-5 z-0">
        <Image
          src="/hive-icon.png"
          alt="TaskHive"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <Header />
      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8 relative z-10 mt-6 sm:mt-16">
        <div className="w-full max-w-xs sm:max-w-sm mx-auto bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/30 rounded-2xl p-4 sm:p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
          {/* Premium accent bar */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 w-20 h-2 rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 blur-sm opacity-80" />
          <h1
            className={
              kanit.className +
              " text-2xl sm:text-3xl text-white font-bold mb-2 mt-2 text-center tracking-tight"
            }
          >
            Log in
          </h1>
          <div className="w-10 border-t border-accent/30 mb-4 sm:mb-8 mt-2" />
          <form className="space-y-4 sm:space-y-6 w-full" onSubmit={handleLogin}>
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
              <p className="text-red-500 text-xs text-center bg-transparent py-1">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors duration-150 text-base shadow-md"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
