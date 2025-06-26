import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Contact() {
  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center relative overflow-hidden">
      {/* Subtle, full-page hive icon background */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-5 z-0">
        <Image
          src="/hive-icon.png"
          alt="TaskHive"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <Header />
      <main className="w-full flex flex-col items-center px-4 pt-26 pb-26 relative z-10">
        <div className="w-full max-w-4xl flex flex-col items-center mt-24">
          {/* Premium accent bar */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-24 h-2 rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 blur-sm opacity-80" />
          <h1
            className={
              kanit.className +
              " text-[48px] md:text-[60px] leading-[1.1] text-white text-center mb-14 font-bold tracking-tight"
            }
          >
            Contact Us
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
            {/* Contact Info Card */}
            <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-10 flex flex-col items-center justify-center shadow-xl min-h-[340px] text-center">
              <div className="flex flex-col items-center w-full">
                <p className="text-[1.35rem] md:text-2xl mb-5 text-gray-200">
                  We are from Timișoara, attending Liceul Teoretic Grigore Moisil.
                </p>
                <p className="text-[1.35rem] md:text-2xl mb-5 text-gray-200">
                  Address: Ghirlandei nr. 4, Timișoara
                </p>
                <div className="flex flex-col gap-3 w-full items-center">
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <FaGithub className="text-primary text-2xl" />
                    Mihai Gorunescu |
                    <a
                      href="https://github.com/mihai888nextlab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-accent transition-colors duration-300"
                    >
                      GitHub
                    </a>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <FaGithub className="text-primary text-2xl" />
                    Cristi Stiegelbauer |
                    <a
                      href="https://github.com/crististg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-accent transition-colors duration-300"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Map Card */}
            <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-4 flex flex-col items-center shadow-xl min-h-[340px]">
              <div className="rounded-xl overflow-hidden w-full h-full shadow-lg border border-gray-700 flex items-center justify-center">
                <iframe
                  src="https://maps.google.com/maps?q=Liceul%20Teoretic%20Grigore%20Moisil%2C%20Timi%C8%99oara&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="rounded-xl"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Liceul Teoretic Grigore Moisil, Timișoara Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
