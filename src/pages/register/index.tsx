import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Loading from "@/components/Loading";
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

export default function Register() {
  const router = useRouter();
  const auth = useAuth();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    userEmail: "",
    userPassword: "",
    confirmPassword: "",
    companyName: "",
    vatNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (
      !values.userEmail ||
      !values.userPassword ||
      !values.firstName ||
      !values.lastName ||
      !values.companyName
    ) {
      setError("All required fields must be filled.");
      setLoading(false);
      return;
    }

    if (values.userPassword !== values.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await auth.register(
        values.userEmail,
        values.userPassword,
        values.firstName,
        values.lastName,
        values.companyName,
        values.vatNumber
      );

      if (!res) {
        throw new Error("Registration failed. Please check your details.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during registration.");
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none opacity-5 z-0">
        <Image
          src="/hive-icon.png"
          alt="TaskHive"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <Header />

      {loading && <Loading />}

      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center px-2 sm:px-4 py-8 relative z-10 mt-16">
        <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/30 rounded-2xl p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
          {/* Premium accent bar */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 w-20 h-2 rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 blur-sm opacity-80" />
          <h1
            className={
              kanit.className +
              " text-3xl text-white font-bold mb-2 mt-2 text-center tracking-tight"
            }
          >
            Register
          </h1>
          <div className="w-10 border-t border-accent/30 mb-8 mt-2" />
          <form className="space-y-5 w-full" onSubmit={handleRegister}>
            <div className="flex space-x-4">
              <FloatingLabelInput
                id="firstName"
                label="First Name"
                type="text"
                name="firstName"
                required
                onChange={(e) =>
                  setValues({ ...values, firstName: e.target.value })
                }
                value={values.firstName}
              />
              <FloatingLabelInput
                id="lastName"
                label="Last Name"
                type="text"
                name="lastName"
                required
                onChange={(e) =>
                  setValues({ ...values, lastName: e.target.value })
                }
                value={values.lastName}
              />
            </div>
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
            <FloatingLabelInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              required
              onChange={(e) =>
                setValues({ ...values, confirmPassword: e.target.value })
              }
              value={values.confirmPassword}
            />
            <FloatingLabelInput
              id="companyName"
              label="Company Name"
              type="text"
              name="companyName"
              required
              onChange={(e) =>
                setValues({ ...values, companyName: e.target.value })
              }
              value={values.companyName}
            />
            <FloatingLabelInput
              id="vatNumber"
              label="Company VAT Number"
              type="text"
              name="vatNumber"
              required
              onChange={(e) =>
                setValues({ ...values, vatNumber: e.target.value })
              }
              value={values.vatNumber}
            />

            {error && (
              <div className="text-red-500 text-xs text-center bg-transparent py-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors duration-150 text-base shadow-md"
              disabled={loading}
            >
              Register
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-8">
            Do you have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
