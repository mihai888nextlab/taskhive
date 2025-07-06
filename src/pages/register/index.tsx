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
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

function RegisterForm() {
  const router = useRouter();
  const auth = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

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

    let recaptchaToken = null;
    if (executeRecaptcha) {
      recaptchaToken = await executeRecaptcha("register");
    }
    if (!recaptchaToken) {
      setError("Could not verify reCAPTCHA. Please try again.");
      setLoading(false);
      return;
    }

    // Verify reCAPTCHA token with backend
    try {
      const verifyRes = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recaptchaToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setError(verifyData.error || "reCAPTCHA verification failed. Please try again.");
        setLoading(false);
        return;
      }
    } catch (err) {
      setError("Could not verify reCAPTCHA. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Pass recaptchaToken to your backend for verification if needed
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
    <div className="min-w-full min-h-screen bg-[#18181b] text-white flex flex-col items-center relative overflow-hidden">
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
        <Card className="w-full max-w-lg mx-auto bg-[#23272f] border border-accent/30 rounded-2xl p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
          {/* Premium accent bar */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 w-20 h-2 rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 blur-sm opacity-80" />
          <CardHeader className="flex flex-col items-center justify-center w-full">
            <CardTitle
              className={
                kanit.className +
                " text-3xl text-white font-bold mb-2 mt-2 tracking-tight text-center w-fit mx-auto"
              }
            >
              Register
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
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

              {/* Add a visible reCAPTCHA badge/info for user clarity */}
              <div className="text-xs text-gray-400 text-center mb-2">
                This site is protected by reCAPTCHA and the Google&nbsp;
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a>
                &nbsp;and&nbsp;
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms of Service</a>
                &nbsp;apply.
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                Register
              </Button>
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
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function Register() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}>
      <RegisterForm />
    </GoogleReCaptchaProvider>
  );
}