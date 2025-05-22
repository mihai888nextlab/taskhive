import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Help() {
  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center">
      <Header />

      <main className="w-[1400px] flex flex-col items-center mt-30 mb-20 px-10">
        <div className="w-full max-w-[1200px] flex flex-col items-center justify-center">
          <h1
            className={
              kanit.className +
              " text-[60px] leading-[70px] text-primary text-center mb-16 border-b-4 border-accent pb-5"
            }
          >
            How TaskHive Works
          </h1>

          <section className="bg-dark p-12 rounded-xl shadow-2xl w-full">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-primary hover:text-white transition-colors duration-300">
                1. Admin Account
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                TaskHive allows you to create an admin account for your organization. 
                As an admin, you can manage the structure of your organization and oversee all operations.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-primary hover:text-white transition-colors duration-300">
                2. Adding Collaborators
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                You can add multiple collaborators or staff members to your organization. 
                Each collaborator can be assigned specific roles and responsibilities.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-primary hover:text-white transition-colors duration-300">
                3. Task Assignment
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                Tasks can be assigned to collaborators based on the company's hierarchy. 
                The hierarchy is defined using a dynamic organizational chart created by the admin. 
                This ensures that tasks are distributed efficiently and according to the structure of the organization.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-primary hover:text-white transition-colors duration-300">
                4. Calendar Integration
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                TaskHive includes an integrated calendar to help you track deadlines and manage schedules effectively. 
                This feature ensures that all team members stay on top of their tasks and meet deadlines.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary hover:text-white transition-colors duration-300">
                5. Communication Channels
              </h2>
              <p className="text-lg leading-8 text-gray-300">
                TaskHive also provides communication channels for employees, enabling seamless collaboration and 
                effective communication within the team.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}