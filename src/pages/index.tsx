import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center">
      <Header />

      <main className="w-[1200px]">
        {/* Hero Section */}
        <div className="w-full h-screen flex flex-col items-center justify-center text-center">
          <h1
            className={
              kanit.className +
              " text-[50px] leading-[60px] text-white max-w-[800px] mb-6"
            }
          >
            Empower Your Team with Smarter Task Management
          </h1>
          <p className="text-xl text-gray-300 max-w-[600px] mb-10">
            Streamline your workflow, improve collaboration, and achieve your goals with TaskHive.
          </p>
          <div className="flex space-x-4">
            <a
              href="/register"
              className="bg-primary text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Get Started for Free
            </a>
            <a
              href="/features"
              className="border-2 border-primary text-primary py-3 px-6 rounded-lg text-lg font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full py-20 bg-background">
          <h2
            className={
              kanit.className +
              " text-[40px] leading-[50px] text-primary text-center mb-16"
            }
          >
            Why Choose TaskHive?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-10">
            <div className="text-center bg-dark p-6 rounded-lg shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4">
                Dynamic Organizational Chart
              </h3>
              <p className="text-gray-300">
                Define roles and assign tasks effortlessly.
              </p>
            </div>
            <div className="text-center bg-dark p-6 rounded-lg shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4">
                Integrated Calendar
              </h3>
              <p className="text-gray-300">
                Stay on top of deadlines and schedules.
              </p>
            </div>
            <div className="text-center bg-dark p-6 rounded-lg shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4">
                Seamless Communication
              </h3>
              <p className="text-gray-300">
                Collaborate with your team in real-time.
              </p>
            </div>
            <div className="text-center bg-dark p-6 rounded-lg shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4">
                Scalable Design
              </h3>
              <p className="text-gray-300">
                Built to grow with your organization.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}