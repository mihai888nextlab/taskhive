import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  FaUserShield,
  FaUsers,
  FaTasks,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa"; // Import icons

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Help() {
  return (
    <div className="min-w-full min-h-screen text-white flex flex-col items-center bg-background">
      <Header />

      <main className="w-full flex flex-col items-center mt-30 mb-20 px-6">
        <div className="w-full max-w-[1200px] flex flex-col items-center justify-center">
          <h1
            className={
              kanit.className +
              " text-[60px] leading-[70px] text-primary text-center mb-16 border-b-4 border-accent pb-5 animate-fade-in"
            }
          >
            How TaskHive Works
          </h1>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Section 1 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <FaUserShield className="text-4xl text-accent mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-primary hover:text-white transition-colors duration-300">
                1. Admin Account
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                TaskHive allows you to create an admin account for your
                organization. As an admin, you can manage the structure of your
                organization and oversee all operations.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <FaUsers className="text-4xl text-accent mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-primary hover:text-white transition-colors duration-300">
                2. Adding Collaborators
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                You can add multiple collaborators or staff members to your
                organization. Each collaborator can be assigned specific roles
                and responsibilities.
              </p>
            </div>

            {/* Section 3 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <FaTasks className="text-4xl text-accent mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-primary hover:text-white transition-colors duration-300">
                3. Task Assignment
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                Tasks can be assigned to collaborators based on the
                company&apos;s hierarchy. The hierarchy is defined using a
                dynamic organizational chart created by the admin.
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <FaCalendarAlt className="text-4xl text-accent mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-primary hover:text-white transition-colors duration-300">
                4. Calendar Integration
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                TaskHive includes an integrated calendar to help you track
                deadlines and manage schedules effectively.
              </p>
            </div>

            {/* Section 5 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <FaComments className="text-4xl text-accent mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-primary hover:text-white transition-colors duration-300">
                5. Communication Channels
              </h2>
              <p className="text-lg leading-8 text-gray-300">
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
