import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="min-w-full min-h-screen bg-[#18181b] text-white flex flex-col items-center relative overflow-hidden">
      <Header />
      {/* Hero Section with backlight and hive icon background */}
      <main className="w-full flex flex-col items-center justify-center relative px-4 py-16 mt-20">
        {/* Hive icon background */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-5 z-0">
          <img src="/hive-icon.png" alt="TaskHive" style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", left: 0, top: 0 }} />
        </div>
        {/* Orange backlight effect behind pricing card */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none" style={{ width: '700px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0.10) 60%, rgba(30,41,59,0.0) 100%)',
            filter: 'blur(100px)',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            opacity: 0.7,
            mixBlendMode: 'lighten',
          }} />
        </div>
        <div className="relative z-20 flex flex-col items-center w-full px-4 sm:px-0">
          <h1 className="text-[2rem] xs:text-[2.2rem] sm:text-[2.5rem] md:text-[2.7rem] lg:text-[3rem] font-bold leading-tight text-white max-w-2xl sm:max-w-3xl md:max-w-4xl mb-4 sm:mb-6 tracking-tight drop-shadow-2xl text-center">
            Simple and Affordable Pricing Plans
          </h1>
          <p className="text-primary/80 text-lg sm:text-xl font-medium mb-10 max-w-xl mx-auto text-center">
            Start tracking and improving your productivity management
          </p>
          <div className="flex flex-col items-center justify-center gap-8 w-full">
            <div
              className="relative rounded-2xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-600 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(36,37,42,0.92) 60%, rgba(59,130,246,0.08) 100%)',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(59,130,246,0.18)',
                overflow: 'hidden',
              }}
            >
              <h2 className="text-3xl font-semibold mb-2 text-white tracking-tight">Free</h2>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-white drop-shadow">$0</span>
                <span className="text-base text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-gray-300 mb-4 text-center text-base">Great for trying out TaskHive and for tiny teams</p>
              <Link href="/register">
                <Button
                  className="w-full bg-primary text-white font-semibold rounded-lg shadow-lg py-3 text-lg mb-4 border-none transition-all duration-150"
                  style={{
                    boxShadow: '0 2px 12px 0 rgba(59,130,246,0.18)',
                    letterSpacing: '0.02em',
                  }}
                >
                  Start for Free
                </Button>
              </Link>
              <div className="w-full border-t border-gray-700 my-4 opacity-60"></div>
              <div className="w-full">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 tracking-wide">FEATURES</h3>
                <ul className="text-gray-300 text-left space-y-2">
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-primary/60 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#3b82f6" opacity="0.7"/><path d="M4.5 6.5L6 8L8 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Unlimited tasks</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-primary/60 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#3b82f6" opacity="0.7"/><path d="M4.5 6.5L6 8L8 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Unlimited projects</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-primary/60 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#3b82f6" opacity="0.7"/><path d="M4.5 6.5L6 8L8 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Basic collaboration features</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-primary/60 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#3b82f6" opacity="0.7"/><path d="M4.5 6.5L6 8L8 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Access to all core features</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-primary/60 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#3b82f6" opacity="0.7"/><path d="M4.5 6.5L6 8L8 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Basic security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
