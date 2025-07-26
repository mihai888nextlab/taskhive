import React, { useMemo } from "react";
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
  FaBullhorn,
  FaUserClock,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import { MdSdStorage, MdSettings } from "react-icons/md";

const HelpSection = React.memo(function HelpSection({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative bg-gradient-to-br from-white/10 via-background/60 to-white/5 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 sm:p-10 flex flex-col items-start shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/40 min-h-[260px]">
      {icon}
      <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white tracking-tight">
        {title}
      </h2>
      <p className="text-base leading-7 text-gray-300">{desc}</p>
    </div>
  );
});

export default function Help() {
  return (
    <div className="min-w-full min-h-screen text-white flex flex-col items-center bg-[#18181b] relative overflow-hidden">
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
          <h1 className=" text-[2.2rem] xs:text-[2.7rem] sm:text-[2.9rem] md:text-[60px] leading-[1.1] text-white text-center mb-10 sm:mb-14 border-b-4 border-accent pb-3 sm:pb-5 animate-fade-in font-bold tracking-tight">
            How TaskHive Works
          </h1>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 w-full">
            <HelpSection
              icon={<FaTasks className="text-4xl text-primary mb-5 drop-shadow" />}
              title="Task Management"
              desc="Organize, assign, and track tasks with clarity. Set priorities, deadlines, and monitor progress easily."
            />
            <HelpSection
              icon={<FaCalendarAlt className="text-4xl text-primary mb-5 drop-shadow" />}
              title="Integrated Calendar"
              desc="Keep up with deadlines and events using a unified calendar. Sync tasks and meetings for your team."
            />
            <HelpSection
              icon={<FaBullhorn className="text-4xl text-primary mb-5 drop-shadow" />}
              title="Announcements"
              desc="Share updates and keep everyone informed. Broadcast news and reminders to your organization."
            />
            <HelpSection
              icon={<FaComments className="text-4xl text-primary mb-5 drop-shadow" />}
              title="Team Communication"
              desc="Collaborate in real-time with chat and notifications. Discuss projects and share feedback securely."
            />
            <HelpSection
              icon={<FaUserClock className="text-4xl text-primary mb-5 drop-shadow" />}
              title="User Management"
              desc="Manage users, roles, and permissions. Assign responsibilities and control access easily."
            />
            <HelpSection
              icon={<FaMoneyBillWave className="text-4xl text-primary mb-5 drop-shadow" />}
              title="Finance Tracking"
              desc="Track expenses, incomes, and financial stats. Get a clear overview and manage budgets."
            />
            <HelpSection
              icon={<FaClock className="text-4xl text-primary mb-5 drop-shadow" />}
              title="Time Tracking"
              desc="Monitor work sessions and boost productivity. Log hours and analyze time spent on tasks."
            />
            <HelpSection
              icon={<MdSdStorage className="text-4xl text-primary mb-5 drop-shadow" />}
              title="File Storage"
              desc="Upload, organize, and search your files securely. Store documents and assets in one place."
            />
            <HelpSection
              icon={<MdSettings className="text-4xl text-primary mb-5 drop-shadow" />}
              title="Custom Settings"
              desc="Personalize your workspace and notifications. Adjust preferences to fit your workflow."
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
