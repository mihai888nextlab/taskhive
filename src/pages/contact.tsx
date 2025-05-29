import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { FaGithub } from "react-icons/fa";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Contact() {
  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center">
      <Header />

      <main className="w-full flex flex-col items-center px-6 pt-10">
        <div className="w-full max-w-[1200px] min-h-screen flex flex-col items-center mt-30">
          {/* Heading */}
          <h1
            className={
              kanit.className +
              " text-[60px] leading-[70px] text-white text-center mb-10 animate-fade-in"
            }
          >
            Contact Us
          </h1>

          {/* Content Section */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-10">
            {/* Text Section */}
            <div className="flex flex-col items-center text-center w-full md:w-1/2 px-5">
              <p className="text-2xl mb-5">
                We are from Timișoara, attending Liceul Teoretic Grigore Moisil.
              </p>
              <p className="text-2xl mb-5">
                Address: Ghirlandei nr. 4, Timișoara
              </p>
              <p className="text-2xl mb-5 flex items-center justify-center gap-2">
                <FaGithub className="text-primary text-3xl" />
                Mihai Gorunescu |{" "}
                <a
                  href="https://github.com/mihai888nextlab"
                  target="_blank"
                  className="text-primary underline hover:text-accent transition-colors duration-300"
                >
                  GitHub
                </a>
              </p>
              <p className="text-2xl mb-5 flex items-center justify-center gap-2">
                <FaGithub className="text-primary text-3xl" />
                Cristi Stiegelbauer |{" "}
                <a
                  href="https://github.com/crististg"
                  target="_blank"
                  className="text-primary underline hover:text-accent transition-colors duration-300"
                >
                  GitHub
                </a>
              </p>
            </div>

            {/* Map Section */}
            <div className="w-full md:w-1/2 px-5">
              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-700">
                <iframe
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAs9BUK-uTUjskSoKUK7i4g0YZ42IxybbY&q=Liceul+Teoretic+Grigore+Moisil,Timișoara"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="rounded-xl"
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
