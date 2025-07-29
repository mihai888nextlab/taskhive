import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { Kanit } from "next/font/google";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { useRouter } from "next/router";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Demo() {
  const auth = useAuth();
  const router = useRouter();

  const handleDemoLogin = async (nr: number) => {
    const res = await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nr }),
    });
    if (!res.ok) {
      console.error("Failed to login with demo account");
      return;
    }

    window.location.href = "/app";
  };

  return (
    <div className="min-w-full min-h-screen flex flex-col items-center bg-[#18181b] text-white relative overflow-hidden">
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
        <button
          onClick={() => handleDemoLogin(1)}
          className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 my-2"
        >
          Demo Account 1
        </button>
        <button
          onClick={() => handleDemoLogin(2)}
          className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 my-2"
        >
          Demo Account 2
        </button>
        <button
          onClick={() => handleDemoLogin(3)}
          className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 my-2"
        >
          Demo Account 3
        </button>
        <button
          onClick={() => handleDemoLogin(4)}
          className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 my-2"
        >
          Demo Account 4
        </button>
        <button
          onClick={() => handleDemoLogin(5)}
          className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 my-2"
        >
          Demo Account 5
        </button>
      </main>
      <Footer />
    </div>
  );
}
