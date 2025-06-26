import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function Header() {
  const pages = [
    { name: "Product", href: "/" },
    { name: "Customers", href: "/customers" },
    { name: "Company", href: "/company" },
    { name: "Pricing", href: "/pricing" },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4 relative">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="TaskHive Logo" width={140} height={48} className="object-contain" priority />
        </Link>
        {/* Desktop Nav */}
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
        {/* Desktop Buttons */}
        <div className="hidden sm:flex gap-2">
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
        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center text-white text-3xl ml-2 z-50"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-background/95 z-40 flex flex-col items-center justify-center gap-8 animate-fade-in">
            <ul className="flex flex-col gap-6 text-2xl font-semibold">
              {pages.map((page) => (
                <li key={page.name}>
                  <Link
                    href={page.href}
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 mt-6 w-full items-center">
              <Link
                href="/login"
                className="w-40 text-center px-5 py-2 border border-white/30 rounded-full text-white font-medium hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="w-40 text-center px-5 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-primary-dark transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
