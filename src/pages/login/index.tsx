import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { Kanit } from "next/font/google";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Login() {
  const auth = useAuth();

  const [values, setValues] = useState({
    userEmail: "",
    userPassword: "",
  });

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await auth.login("credentials", {
      email: values.userEmail,
      password: values.userPassword,
    });
  };

  return (
    <div className="min-w-full min-h-screen flex flex-col items-center bg-[#18181b] text-white relative overflow-hidden">
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
        <LoginForm
          handleLogin={handleLogin}
          values={values}
          setValues={setValues}
        />
      </main>
      <Footer />
    </div>
  );
}
