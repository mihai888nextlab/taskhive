import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-accent/30 mt-32 pt-10 pb-6">
      <div className="max-w-7xl mx-auto relative px-4 sm:px-8 flex flex-col items-center">
        {/* Top section: stacked on mobile, row on desktop */}
        <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-10">
          {/* Left: Logo and slogan */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0 z-10">
            <Link href="/" className="mb-3">
              <Image
                src="/logo.png"
                alt="TaskHive Logo"
                width={120}
                height={40}
                className="object-contain drop-shadow-xl"
                priority
                unoptimized
              />
            </Link>
            <p className="text-gray-400 text-sm mt-1 italic tracking-wide">
              Organize. Achieve. Thrive.
            </p>
          </div>
          {/* Center: Nav links, always centered horizontally */}
          <nav className="flex flex-wrap gap-4 sm:gap-6 text-gray-300 text-base font-medium justify-center items-center w-full md:w-auto md:absolute left-1/2 md:-translate-x-1/2 top-0 md:top-1/2 md:-mt-4 py-4 md:py-0 z-20">
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
            <a
              href="https://drive.google.com/file/d/12ue5y65thsPObFLDn4PQFR94dA3rxMyf/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Documentation
            </a>
            <Link href="/help" className="hover:text-primary transition-colors">
              Help
            </Link>
            <a
              href="https://github.com/mihai888nextlab/taskhive"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </nav>
          {/* Right: Authors and copyright */}
          <div className="flex flex-col items-center md:items-end text-gray-500 text-xs mt-6 md:mt-0 z-10">
            <div className="flex items-center gap-1 flex-wrap justify-center md:justify-end">
              <span>Made by</span>
              <a
                href="https://github.com/mihai888nextlab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Mihai Gorunescu
              </a>
              <span>&</span>
              <a
                href="https://github.com/crististg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Cristi Stiegelbauer
              </a>
            </div>
            <div className="mt-2 text-xs text-gray-600 tracking-wide">
              ©2025 TaskHive. All rights reserved.
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 px-4 sm:px-8 border-t border-accent/20 mt-8 text-center md:text-left gap-2 md:gap-0">
        <span>Privacy Policy · Terms of Service</span>
        <span>
          Built with{" "}
          <span className="text-primary font-bold">♥</span> for teams.
        </span>
      </div>
    </footer>
  );
}
