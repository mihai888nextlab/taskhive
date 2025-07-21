import Header from "@/components/header";
import Footer from "@/components/footer";
import Loading from "@/components/Loading";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { RegisterForm } from "@/components/register-form";
import { useAuth } from "@/hooks/useAuth";

export function RegisterPage() {
  const auth = useAuth();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await auth.register(
      values.email,
      values.password,
      values.confirmPassword,
      values.firstName,
      values.lastName
    );
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

      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center px-2 sm:px-4 py-8 relative z-10 mt-20">
        <RegisterForm
          handleRegister={handleRegister}
          values={values}
          setValues={setValues}
        ></RegisterForm>
      </main>
      <Footer />
    </div>
  );
}

export default function Register() {
  return <RegisterPage />;
}
