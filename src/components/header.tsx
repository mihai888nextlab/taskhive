import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import React from "react";

const Header: React.FC = React.memo(() => {
  const pages = [
    { name: "Product", href: "/" },
    { name: "Customers", href: "/customers" },
    { name: "Company", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoize mobile menu toggle
  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen((v) => !v);
  }, []);

  // Memoize close menu handler
  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md bg-[#18181b]/90 shadow-lg"
          : "bg-[#18181b]"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4 relative">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="TaskHive Logo" width={180} height={60} className="object-contain hidden md:block" priority />
          <Image src="/logo.png" alt="TaskHive Logo" width={120} height={40} className="object-contain md:hidden" priority />
        </Link>
        
        <NavigationMenu className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <NavigationMenuList className="flex gap-8 text-base font-medium">
            {pages.map((page) => (
              <NavigationMenuItem key={page.name}>
                <NavigationMenuLink asChild>
                  <Link
                    href={page.href}
                    className="text-white/90 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-transparent"
                  >
                    {page.name}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="hidden sm:flex gap-2">
          <Link href="/login">
            <Button
              variant="outline"
              className="border-white/30 text-white/90 font-medium hover:bg-white/10 rounded-full px-5 py-2"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
            >
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button
              className="bg-primary text-white rounded-full font-semibold shadow hover:bg-primary-dark px-5 py-2"
            >
              Get started
            </Button>
          </Link>
        </div>
        
        <button
          className="md:hidden flex items-center justify-center text-white text-3xl ml-2 z-50"
          onClick={handleMobileMenuToggle}
          aria-label="Open menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[#18181b]/95 z-40 flex flex-col items-center justify-center gap-8 animate-fade-in">
            <ul className="flex flex-col gap-6 text-2xl font-semibold">
              {pages.map((page) => (
                <li key={page.name}>
                  <Link
                    href={page.href}
                    className="text-white hover:text-primary transition-colors"
                    onClick={handleCloseMobileMenu}
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 mt-6 w-full items-center">
              <Link href="/login" className="w-40" onClick={handleCloseMobileMenu}>
                <Button
                  variant="outline"
                  className="w-full text-center border-white/30 text-white font-medium hover:bg-white/10 rounded-full"
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="w-40" onClick={handleCloseMobileMenu}>
                <Button
                  className="w-full text-center bg-primary text-white rounded-full font-semibold shadow hover:bg-primary-dark"
                >
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
});

export default Header;
