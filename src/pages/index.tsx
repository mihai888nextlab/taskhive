import { Kanit } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import Image from "next/image";
import { FaTasks, FaCalendarAlt, FaBullhorn, FaComments, FaUserClock, FaMoneyBillWave, FaClock } from "react-icons/fa";
import { MdSdStorage, MdSettings } from "react-icons/md";
import React, { useRef, useEffect, useState } from "react";

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
        const containerRect = horizontalContentRef.current.getBoundingClientRect();

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
        const animationStartVerticalScroll = window.pageYOffset + containerRect.top - window.innerHeight;

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
          scrollProgress = (currentScrollY - animationStartVerticalScroll) / fixedVerticalAnimationDistance;
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
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Perform an initial calculation and update on component mount
    // to ensure the content is correctly positioned immediately.
    handleScroll();

    // Cleanup function: Remove the event listeners when the component unmounts
    // to prevent memory leaks.
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and once on unmount.

  return (
    <div className="min-w-full min-h-screen bg-background text-white flex flex-col items-center">
      <Header />
      <main className="w-full flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center pt-32 md:pt-67 pb-24 md:pb-40 bg-background relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none opacity-5 z-0">
            <Image
              src="/hive-icon.png"
              alt="TaskHive"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-0">
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
              with{" "}
              <span className="text-primary">Minimal</span> Collaboration
            </h1>
            <p className="text-primary/80 text-base sm:text-lg md:text-xl font-medium mb-7 sm:mb-10 max-w-xl mx-auto">
              Powered by advanced AI for smarter, faster teamwork.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 w-full max-w-xs sm:max-w-none mx-auto">
              <Link
                href="/register"
                className="bg-primary text-white py-3 px-8 sm:px-10 rounded-full text-base sm:text-lg font-semibold shadow-xl hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                href="/features"
                className="border border-primary text-primary py-3 px-8 sm:px-10 rounded-full text-base sm:text-lg font-semibold hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Now smoothly scrolling horizontally as the user scrolls vertically */}
        {/* This container defines the visual space for the features.
            It's no longer sticky, allowing the page to scroll continuously. */}
        <div
          className="relative w-full flex items-center justify-center overflow-hidden py-16 bg-transparent"
          style={{ height: '400px' }}
        >
          {/* This is the actual horizontal content that moves via translateX. */}
          <div
            ref={horizontalContentRef}
            className="flex flex-row gap-8 whitespace-nowrap transition-transform duration-75 ease-out"
            style={{ transform: `translateX(${-horizontalOffset}px)` }}
          >
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="flex-shrink-0 min-w-[320px] max-w-xs flex flex-col items-center bg-dark/70 border border-accent/30 rounded-2xl p-10 min-h-[240px] hover:shadow-2xl hover:border-primary transition-all group snap-center shadow-lg mx-4 overflow-hidden w-full"
                style={{ scrollSnapAlign: 'center', height: 280 }}
              >
                <div className="mb-5 rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition flex items-center justify-center">
                  {feature.icon}
                </div>
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-xl font-semibold mb-2 text-white tracking-tight text-center break-words w-full">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-base font-light text-center break-words whitespace-normal w-full mt-1">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
