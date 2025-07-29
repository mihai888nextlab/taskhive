function CookiesTermsWindow() {
  const [open, setOpen] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('taskhive_cookies_accepted');
      if (!accepted) setOpen(true);
    }
  }, []);
  const handleAccept = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskhive_cookies_accepted', '1');
    }
    setOpen(false);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-xs w-[340px] bg-[#23272f] border border-accent/30 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 animate-fadeInUp" style={{ maxHeight: 260 }}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-white text-base">Cookies & Terms</span>
        <button
          className="text-gray-400 hover:text-primary text-xl font-bold px-2 py-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      {!showTerms ? (
        <>
          <div className="text-gray-300 text-sm mb-2">
            This site uses cookies for essential functionality and analytics. By using TaskHive, you agree to our <button className="text-primary underline hover:text-primary-dark font-medium" onClick={() => setShowTerms(true)}>Terms & Conditions</button>.
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="bg-primary text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-primary-dark transition"
              onClick={handleAccept}
            >Accept</button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-white font-semibold text-base mb-1">Terms & Conditions</div>
          <div className="text-gray-300 text-sm max-h-28 overflow-y-auto pr-1">
            <p className="mb-2">By using TaskHive, you agree to the following terms:</p>
            <ul className="list-disc pl-5 mb-2">
              <li>All data you enter or generate in TaskHive is treated as strictly confidential.</li>
              <li>Your data is never shared or passed to third parties under any circumstances.</li>
              <li>We do <span className="font-bold text-primary">not</span> collect or store personal information such as names, emails, or contact details for advertising or profiling purposes.</li>
              <li>Cookies are used only for essential site functionality and basic analytics.</li>
              <li>You may request deletion of your data at any time.</li>
            </ul>
            <p>For any questions, contact us at <a href="mailto:support@taskhive.app" className="text-primary underline">support@taskhive.app</a>.</p>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              className="px-4 py-1.5 rounded-lg font-semibold text-sm border border-primary text-primary bg-transparent hover:bg-primary/10 transition"
              onClick={() => setShowTerms(false)}
            >Back</button>
            <button
              className="bg-primary text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-primary-dark transition"
              onClick={handleAccept}
            >Accept</button>
          </div>
        </div>
      )}
    </div>
  );
}
import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import Image from "next/image";
import {
  FaTasks,
  FaCalendarAlt,
  FaBullhorn,
  FaComments,
  FaUserClock,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import { MdSdStorage, MdSettings } from "react-icons/md";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Head from "next/head";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const features = [
  {
    icon: <FaTasks className="text-4xl text-primary drop-shadow" />,
    title: "Task Management",
    desc: "Organize, assign, and track tasks with clarity and ease.",
  },
  {
    icon: <FaCalendarAlt className="text-4xl text-primary drop-shadow" />,
    title: "Integrated Calendar",
    desc: "Stay on top of deadlines and events with a unified, minimal calendar view.",
  },
  {
    icon: <FaBullhorn className="text-4xl text-primary drop-shadow" />,
    title: "Announcements",
    desc: "Share important updates and keep everyone in the loop.",
  },
  {
    icon: <FaComments className="text-4xl text-primary drop-shadow" />,
    title: "Team Communication",
    desc: "Collaborate in real-time with built-in chat and notifications.",
  },
  {
    icon: <FaUserClock className="text-4xl text-primary drop-shadow" />,
    title: "User Management",
    desc: "Manage users, roles, and permissions with ease.",
  },
  {
    icon: <FaMoneyBillWave className="text-4xl text-primary drop-shadow" />,
    title: "Finance Tracking",
    desc: "Track expenses, incomes, and financial statistics.",
  },
  {
    icon: <FaClock className="text-4xl text-primary drop-shadow" />,
    title: "Time Tracking",
    desc: "Monitor work sessions and boost productivity.",
  },
  {
    icon: <MdSdStorage className="text-4xl text-primary drop-shadow" />,
    title: "File Storage",
    desc: "Upload, organize, and search your files securely.",
  },
  {
    icon: <MdSettings className="text-4xl text-primary drop-shadow" />,
    title: "Custom Settings",
    desc: "Personalize your workspace and notifications.",
  },
];

export default function Home() {
  // Ref for the container that holds the horizontally scrolling content and gets the transform.
  const horizontalContentRef = useRef<HTMLDivElement>(null);

  // State to store the calculated horizontal offset for the content.
  const [horizontalOffset, setHorizontalOffset] = useState(0);

  // This effect handles the scroll and resize events for the horizontal animation.
  useEffect(() => {
    const handleScroll = () => {
      // Ensure the ref is attached to a DOM element.
      if (horizontalContentRef.current) {
        // Get the bounding rectangle of the horizontal content section.
        // This tells us its position relative to the viewport.
        const containerRect =
          horizontalContentRef.current.getBoundingClientRect();

        // Get the total scrollable width of the content inside the container.
        // This is the sum of the widths of all feature cards, including gaps.
        const totalContentWidth = horizontalContentRef.current.scrollWidth;

        // Get the current width of the browser viewport.
        const viewportWidth = window.innerWidth;

        // Calculate the actual amount the content needs to scroll horizontally.
        // This is the total width minus what's currently visible in the viewport.
        const scrollableContentWidth = totalContentWidth - viewportWidth;

        // Define the vertical scroll zone over which the horizontal animation will occur.
        // The animation starts when the top of the horizontal section is just visible (at the bottom of the viewport).
        const animationStartVerticalScroll =
          window.pageYOffset + containerRect.top - window.innerHeight;

        // The total vertical distance we want the horizontal animation to span.
        // This value can be adjusted to make the horizontal scroll faster or slower
        // relative to the vertical scroll.
        // A larger value means you need to scroll more vertically for the same horizontal movement.
        const fixedVerticalAnimationDistance = 1500; // Example: 1500 pixels of vertical scroll

        // Get the current vertical scroll position of the entire document.
        const currentScrollY = window.pageYOffset;

        // Calculate the progress (0 to 1) of the vertical scroll within our defined animation zone.
        let scrollProgress = 0;
        if (fixedVerticalAnimationDistance > 0) {
          scrollProgress =
            (currentScrollY - animationStartVerticalScroll) /
            fixedVerticalAnimationDistance;
        }

        // Clamp the scroll progress between 0 and 1 to ensure the horizontal content
        // doesn't scroll beyond its start or end points.
        scrollProgress = Math.max(0, Math.min(1, scrollProgress));

        // Calculate the new horizontal offset based on the vertical scroll progress.
        // This is the amount of pixels the content will be translated horizontally.
        const newOffset = scrollProgress * scrollableContentWidth;

        // Update the state, which will trigger a re-render and apply the transform.
        setHorizontalOffset(newOffset);
      }
    };

    // Add event listeners for 'scroll' and 'resize' to continuously update the horizontal position.
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Perform an initial calculation and update on component mount
    // to ensure the content is correctly positioned immediately.
    handleScroll();

    // Cleanup function: Remove the event listeners when the component unmounts
    // to prevent memory leaks.
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and once on unmount.

  const FeatureCard = React.memo(function FeatureCard({
    feature,
  }: {
    feature: (typeof features)[number];
  }) {
    return (
      <Card
        key={feature.title}
        className="flex-shrink-0 min-w-[320px] max-w-xs flex flex-col items-center bg-[#23272f] border border-accent/30 rounded-2xl p-10 min-h-[240px] hover:shadow-2xl hover:border-primary transition-all group snap-center shadow-lg mx-4 overflow-hidden w-full"
        style={{ scrollSnapAlign: "center", height: 280 }}
      >
        <CardHeader className="mb-5 flex items-center justify-center">
          <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition flex items-center justify-center">
            {feature.icon}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center w-full">
          <CardTitle className="text-xl font-semibold mb-2 text-white tracking-tight text-center break-words w-full">
            {feature.title}
          </CardTitle>
          <CardDescription className="text-gray-400 text-base font-light text-center break-words whitespace-normal w-full mt-1">
            {feature.desc}
          </CardDescription>
        </CardContent>
      </Card>
    );
  });

  // FAQ data
  const faqs = [
    {
      question: "What is TaskHive and who is it for?",
      answer:
        "TaskHive is an all-in-one business management platform designed for modern teams, startups, and enterprises. It helps you organize tasks, collaborate, track time, manage finances, and more—all in one place.",
    },
    {
      question: "How does TaskHive help manage tasks and projects?",
      answer:
        "You can create, assign, and track tasks with advanced features like priorities, tags, deadlines, subtasks, and progress tracking. TaskHive's dashboard gives you a clear overview of your team's work.",
    },
    {
      question: "Can I collaborate with my team in real-time?",
      answer:
        "Yes! TaskHive includes built-in chat, announcements, notifications, and file sharing so your team can communicate and work together instantly.",
    },
    {
      question: "Is my data secure and private on TaskHive?",
      answer:
        "Absolutely. TaskHive uses secure authentication, encrypted storage, and privacy-first design to keep your data safe and accessible only to your team.",
    },
    {
      question: "Does TaskHive support finance and time tracking?",
      answer:
        "Yes, you can track expenses, incomes, and financial statistics, as well as monitor work sessions and productivity with integrated time tracking tools.",
    },
    {
      question: "Is TaskHive available internationally and in multiple languages?",
      answer:
        "Yes, TaskHive is designed for global teams. The platform is fully translated and supports over 20 languages, making it accessible from anywhere in the world.",
    },
    {
      question: "Is TaskHive available on mobile devices?",
      answer:
        "TaskHive is fully responsive and works great on desktops, tablets, and smartphones. Mobile apps are coming soon!",
    },
    {
      question: "How do I get started with TaskHive?",
      answer:
        "Simply register for an account, create or join a company, and invite your team. You can start managing tasks and collaborating right away.",
    },
  ];

  // FAQ Accordion component
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Head>
        <title>TaskHive – All-in-One Business Management Tool</title>
        <meta
          name="description"
          content="Empower modern teams with TaskHive: minimal collaboration, advanced AI, task management, calendar, announcements, chat, finance, and more."
        />
        <meta
          name="keywords"
          content="business management, team collaboration, task management, calendar, announcements, chat, finance, productivity, AI"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="TaskHive – All-in-One Business Management Tool"
        />
        <meta
          property="og:description"
          content="Empower modern teams with TaskHive: minimal collaboration, advanced AI, task management, calendar, announcements, chat, finance, and more."
        />
        <meta property="og:image" content="/hive-icon.png" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://taskhive.app/" />
      </Head>
      <div className="min-w-full min-h-screen bg-[#18181b] text-white flex flex-col items-center">
        <Header />
        <CookiesTermsWindow />
        <main className="w-full flex flex-col items-center justify-center">
          {/* Hero Section with orange backlight */}
          <section className="w-full flex flex-col items-center justify-center text-center pt-32 md:pt-67 pb-24 md:pb-40 bg-[#18181b] relative overflow-hidden">
            {/* Hive icon background */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-5 z-0">
              <Image
                src="/hive-icon.png"
                alt="TaskHive"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            {/* Orange backlight effect behind heading */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ width: '900px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0.10) 60%, rgba(30,41,59,0.0) 100%)',
                filter: 'blur(96px)',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0,
                opacity: 0.7,
                mixBlendMode: 'lighten',
              }} />
            </div>
            <div className="relative z-20 flex flex-col items-center w-full px-4 sm:px-0">
              <span className="uppercase tracking-widest text-primary text-base sm:text-lg md:text-xl font-extrabold mb-4 sm:mb-6 px-3 sm:px-4 py-2 rounded-lg shadow-md border border-primary/30 animate-pulse">
                The first all-in-one business management tool
              </span>
              <h1
                className={
                  kanit.className +
                  " text-[2.2rem] xs:text-[2.7rem] sm:text-[2.9rem] md:text-[60px] lg:text-[72px] font-bold leading-tight text-white max-w-2xl sm:max-w-3xl md:max-w-4xl mb-4 sm:mb-6 tracking-tight drop-shadow-2xl"
                }
              >
                Empower Modern Teams
                <br />
                with <span className="text-primary">Minimal</span> Collaboration
              </h1>
              <p className="text-primary/80 text-base sm:text-lg md:text-xl font-medium mb-7 sm:mb-10 max-w-xl mx-auto">
                Powered by advanced AI for smarter, faster teamwork.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 w-full max-w-xs sm:max-w-none mx-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="bg-primary text-white py-3 px-8 sm:px-10 rounded-full text-base sm:text-lg font-semibold shadow-xl hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/features" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="border border-primary text-primary py-3 px-8 sm:px-10 rounded-full text-base sm:text-lg font-semibold hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
              {/* Down arrow right under the hero buttons */}
              <style jsx>{`
                .bounce-arrow {
                  animation: bounce 1.4s infinite;
                  display: inline-block;
                  filter: drop-shadow(0 2px 8px rgba(59,130,246,0.18));
                  transition: transform 0.2s;
                }
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(16px); }
                }
              `}</style>
              <div className="flex justify-center items-center w-full">
                <svg className="bounce-arrow" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 40L16 26H40L28 40Z" fill="#3b82f6" fillOpacity="0.85"/>
                  <path d="M28 40L16 26H40L28 40Z" fill="#fff" fillOpacity="0.7"/>
                </svg>
              </div>
            </div>
          </section>
          {/* Features Section */}
          <div
            className="relative w-full flex items-center justify-center overflow-hidden py-16 bg-transparent"
            style={{ height: "400px" }}
          >
            <div
              ref={horizontalContentRef}
              className="flex flex-row gap-8 whitespace-nowrap transition-transform duration-75 ease-out"
              style={{ transform: `translateX(${-horizontalOffset}px)` }}
            >
              {features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
          {/* FAQ Section */}
          <section className="w-full max-w-3xl mx-auto py-20 px-4">
            <h2 className="text-3xl font-bold text-center mb-3">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-400 text-center mb-10">Answers to the most common questions about TaskHive.</p>
            <div className="flex flex-col gap-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-700">
                  <button
                    className="w-full text-left py-5 px-2 flex items-center justify-between focus:outline-none group"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                    aria-controls={`faq-panel-${idx}`}
                  >
                    <span className="font-semibold text-lg text-white transition-all duration-150 group-hover:underline group-hover:decoration-white group-hover:underline-offset-4">{faq.question}</span>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === idx && (
                    <div
                      id={`faq-panel-${idx}`}
                      className="pb-6 px-2 text-base text-gray-300 animate-fadeIn"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
          {/* Personalized CTA Section for TaskHive */}
          <section className="w-full flex flex-col items-center justify-center py-16 bg-[#18181b] text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Ready to transform your <span className="text-primary bg-primary/10 px-2 py-1 rounded-md">team's productivity</span> ?
            </h2>
            <p className="text-base text-gray-400 mb-6 max-w-md mx-auto">Get started with TaskHive for seamless teamwork.</p>
            <Link href="/register">
              <Button className="bg-primary text-white py-3 px-8 rounded-lg text-base font-semibold shadow-lg hover:bg-primary-dark transition-colors mb-2">
                Get Started
              </Button>
            </Link>
          </section>
        </main>
        <Footer />
    </div>
    </>
  );
}

// SSG for SEO
export async function getStaticProps() {
  return { props: {} };
}
