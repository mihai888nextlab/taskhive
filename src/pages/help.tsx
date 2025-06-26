import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import {
  FaUserShield,
  FaUsers,
  FaTasks,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Help() {
  return (
    <div className="min-w-full min-h-screen text-white flex flex-col items-center bg-background relative overflow-hidden">
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
      <main className="w-full flex flex-col items-center mt-20 sm:mt-32 mb-10 sm:mb-20 px-2 sm:px-6 relative z-10">
        <div className="w-full max-w-5xl flex flex-col items-center justify-center">
          {/* Premium accent bar */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-24 h-2 rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 blur-sm opacity-80" />
          <h1
            className={
              kanit.className +
              " text-[2.2rem] xs:text-[2.7rem] sm:text-[2.9rem] md:text-[60px] leading-[1.1] text-white text-center mb-10 sm:mb-14 border-b-4 border-accent pb-3 sm:pb-5 animate-fade-in font-bold tracking-tight"
            }
          >
            How TaskHive Works
          </h1>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 w-full">
            {/* Section 1 */}
            <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 sm:p-10 flex flex-col items-start shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/40 min-h-[260px]">
              <FaUserShield className="text-4xl text-primary mb-5 drop-shadow" />
              <h2
                className={
                  kanit.className +
                  " text-xl sm:text-2xl font-bold mb-3 text-white tracking-tight"
                }
              >
                1. Admin Account
              </h2>
              <p className="text-base leading-7 text-gray-300">
                TaskHive allows you to create an admin account for your
                organization. As an admin, you can manage the structure of your
                organization and oversee all operations.
              </p>
            </div>
            {/* Section 2 */}
            <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 sm:p-10 flex flex-col items-start shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/40 min-h-[260px]">
              <FaUsers className="text-4xl text-primary mb-5 drop-shadow" />
              <h2
                className={
                  kanit.className +
                  " text-xl sm:text-2xl font-bold mb-3 text-white tracking-tight"
                }
              >
                2. Adding Collaborators
              </h2>
              <p className="text-base leading-7 text-gray-300">
                You can add multiple collaborators or staff members to your
                organization. Each collaborator can be assigned specific roles
                and responsibilities.
              </p>
            </div>
            {/* Section 3 */}
            <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 sm:p-10 flex flex-col items-start shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/40 min-h-[260px]">
              <FaTasks className="text-4xl text-primary mb-5 drop-shadow" />
              <h2
                className={
                  kanit.className +
                  " text-xl sm:text-2xl font-bold mb-3 text-white tracking-tight"
                }
              >
                3. Task Assignment
              </h2>
              <p className="text-base leading-7 text-gray-300">
                Tasks can be assigned to collaborators based on the
                company&apos;s hierarchy. The hierarchy is defined using a
                dynamic organizational chart created by the admin.
              </p>
            </div>
            {/* Section 4 */}
            <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 sm:p-10 flex flex-col items-start shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/40 min-h-[260px]">
              <FaCalendarAlt className="text-4xl text-primary mb-5 drop-shadow" />
              <h2
                className={
                  kanit.className +
                  " text-xl sm:text-2xl font-bold mb-3 text-white tracking-tight"
                }
              >
                4. Calendar Integration
              </h2>
              <p className="text-base leading-7 text-gray-300">
                TaskHive includes an integrated calendar to help you track
                deadlines and manage schedules effectively.
              </p>
            </div>
            {/* Section 5 */}
            <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 sm:p-10 flex flex-col items-start shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/40 min-h-[260px]">
              <FaComments className="text-4xl text-primary mb-5 drop-shadow" />
              <h2
                className={
                  kanit.className +
                  " text-xl sm:text-2xl font-bold mb-3 text-white tracking-tight"
                }
              >
                5. Communication Channels
              </h2>
              <p className="text-base leading-7 text-gray-300">
                TaskHive provides communication channels for employees, enabling
                seamless collaboration and effective communication within the
                team.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
