import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-accent mt-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-12 px-6 gap-10">
        {/* Logo and tagline */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="mb-3">
            <Image
              src="/logo.png"
              alt="TaskHive Logo"
              width={140}
              height={48}
              className="object-contain drop-shadow-lg"
            />
          </Link>
          <p className="text-gray-400 text-base mt-1 italic tracking-wide">
            Organize. Achieve. Thrive.
          </p>
        </div>
        {/* Navigation links */}
        <nav className="flex flex-col md:flex-row items-center gap-6 text-gray-300 text-base font-medium">
          <Link href="/contact" className="hover:text-primary transition-colors duration-200">
            Contact
          </Link>
          <a
            href="https://drive.google.com/file/d/12ue5y65thsPObFLDn4PQFR94dA3rxMyf/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-200"
          >
            Documentation
          </a>
          <Link href="/help" className="hover:text-primary transition-colors duration-200">
            Help
          </Link>
          <a
            href="https://github.com/mihai888nextlab/taskhive"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-200"
          >
            GitHub
          </a>
        </nav>
        {/* Credits and copyright */}
        <div className="flex flex-col items-center md:items-end text-gray-500 text-sm">
          <div className="flex items-center gap-1">
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
      <div className="w-full">
        <div className="max-w-6xl mx-auto py-4 px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
          <span>
            Privacy Policy · Terms of Service
          </span>
          <span className="mt-2 md:mt-0">
            Built with <span className="text-primary font-bold">♥</span> for teams.
          </span>
        </div>
      </div>
    </footer>
  );
}
