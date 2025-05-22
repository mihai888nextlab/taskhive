import Image from "next/image";
import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Contact() {
  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center">
      <Header />

      <main className="w-[1200px] flex flex-col items-center">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="flex flex-row items-center justify-between w-full">
            {/* Text Section */}
            <div className="flex flex-col items-center text-center w-1/2 px-5">
              <h1
                className={
                  kanit.className +
                  " m-0 text-[70px] leading-[80px] text-white"
                }
              >
                Contact Us
              </h1>
              <p className="mt-10 text-2xl">
                We are from Timișoara, attending Liceul Teoretic Grigore Moisil.
              </p>
              <p className="mt-5 text-2xl">
                Address: Ghirlandei nr. 4, Timișoara
              </p>
              <p className="mt-5 text-2xl">
                Mihai Gorunescu |{" "}
                <a
                  href="https://github.com/mihai888nextlab"
                  className="text-primary underline"
                >
                  GitHub
                </a>
              </p>
              <p className="mt-5 text-2xl">
                Cristi Stiegelbauer |{" "}
                <a
                  href="https://github.com/crististg"
                  className="text-primary underline"
                >
                  GitHub
                </a>
              </p>
            </div>

            {/* Map Section */}
            <div className="w-1/2 px-5">
            <iframe
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAs9BUK-uTUjskSoKUK7i4g0YZ42IxybbY&q=Liceul+Teoretic+Grigore+Moisil,Timișoara"                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
            ></iframe>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}