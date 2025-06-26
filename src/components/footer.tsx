import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-accent/30 mt-32 pt-10 pb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 px-8 relative">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="mb-3">
            <Image
              src="/logo.png"
              alt="TaskHive Logo"
              width={160}
              height={54}
              className="object-contain drop-shadow-xl"
            />
          </Link>
          <p className="text-gray-400 text-sm mt-1 italic tracking-wide">
            Organize. Achieve. Thrive.
          </p>
        </div>
        <nav className="flex flex-wrap gap-6 text-gray-300 text-base font-medium absolute left-1/2 -translate-x-1/2 justify-center">
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
        <div className="flex flex-col items-center md:items-end text-gray-500 text-xs">
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
      <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 px-8 border-t border-accent/20 mt-8">
        <span>Privacy Policy · Terms of Service</span>
        <span className="mt-2 md:mt-0">
          Built with{" "}
          <span className="text-primary font-bold">♥</span> for teams.
        </span>
      </div>
    </footer>
  );
}
