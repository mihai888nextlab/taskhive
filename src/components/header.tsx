import { useState, useEffect } from "react";

export default function Header() {
  const pages = [
    {
      name: "Product",
      href: "/",
    },
    {
      name: "Customers",
      href: "/customers",
    },
    {
      name: "Company",
      href: "/company",
    },
    {
      name: "Pricing",
      href: "/pricing",
    },
  ];

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Trigger animation after scrolling 50px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-[100px] py-3 flex items-center justify-center bg-transparent transition-transform duration-500 ${
        isScrolled ? "translate-y-0" : "-translate-y-5"
      }`}
    >
      <nav className="w-[1200px] h-full py-4 px-5 rounded-xl border-2 border-accent flex items-center justify-between bg-background">
        <div className="h-full py-2">
          <a href="/">
            <img src="logo.png" alt="logo" className="h-full" />
          </a>
        </div>
        <div className="h-full flex">
          <ul className="flex">
            {pages.map((page) => (
              <li key={page.name} className="h-full flex items-center px-4">
                <a
                  href={page.href}
                  className="text-white hover:text-primary transition-colors duration-300"
                >
                  {page.name}
                </a>
              </li>
            ))}
          </ul>
          <button className="h-full flex items-center px-4 py-2 border-[1.5px] border-white rounded-lg text-white font-semibold ml-4">
            <a href="/login">Log in</a>
          </button>
          <button className="h-full flex items-center px-4 py-2 border-2 border-primary bg-primary rounded-lg font-semibold ml-3">
            <a href="/register">Get started for free</a>
          </button>
        </div>
      </nav>
    </header>
  );
}