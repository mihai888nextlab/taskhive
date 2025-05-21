import Image from "next/image";
import { Kanit } from "next/font/google";
import Header from "@/components/header";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center">
      <Header />

      <main className="w-[1200px]">
        <div className="w-full h-screen flex flex-col items-center justify-center">
          <h1
            className={
              kanit.className +
              " m-0 text-center max-w-1/2 text-[50px] leading-[60px] text-white"
            }
          >
            Accounting Software That Exceeds Expectations
          </h1>
          <p className="mt-10 text-xl">
            Built native to{" "}
            <a href="#" className="text-primary">
              blabla
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
