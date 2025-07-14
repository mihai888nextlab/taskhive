import Header from "@/components/header";
import Footer from "@/components/footer";
import Loading from "@/components/Loading";
import { useState } from "react";
import Image from "next/image";
import { RegisterForm } from "@/components/register-form";

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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

      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center px-2 sm:px-4 py-8 relative z-10 mt-20">
        <RegisterForm googleClientId={googleClientId}></RegisterForm>
      </main>
      <Footer />
    </div>
  );
}

export default function Register() {
  return <RegisterPage />;
}
