import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const pages = [
    { name: "Product", href: "/" },
    { name: "Customers", href: "/customers" },
    { name: "Company", href: "/company" },
    { name: "Pricing", href: "/pricing" },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-md bg-background/80 shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4 relative">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="TaskHive Logo" width={192} height={64} className="object-contain" priority />
        </Link>
        <ul className="hidden md:flex gap-8 text-base font-medium absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {pages.map((page) => (
            <li key={page.name}>
              <Link
                href={page.href}
                className="text-white/90 hover:text-primary transition-colors px-2 py-1 rounded-md"
              >
                {page.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-5 py-2 border border-white/30 rounded-full text-white/90 font-medium hover:bg-white/10 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-primary-dark transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
