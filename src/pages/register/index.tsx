import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/header";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

export default function Register() {
  const router = useRouter();

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

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.userEmail,
          password: values.userPassword,
          firstName: values.firstName,
          lastName: values.lastName,
          companyName: values.companyName,
          companyRegistrationNumber: values.vatNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login or a success page
        router.push("/auth/login");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center">
      <Header />

      <main className="w-[1200px] h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Register
          </h1>
          <form className="space-y-6" onSubmit={handleRegister}>
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
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Register
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
