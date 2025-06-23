import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <div className="w-screen h-fit border-t-2 border-accent relative">
        <div className="m-[30px] p-10 w-fit h-[250px] absolute left-0 top-0">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="logo"
              width={120}
              height={40}
              className="h-[40px]"
            />
            {/* Removed duplicate <img> tag and replaced with optimized <Image> */}
            <Image
              src="/logo.png"
              alt="logo"
              width={120}
              height={40}
              className="h-[40px]"
            />
          </Link>

          <p className="px-2 pt-5 text-xl text-white">
            Organize. Achieve. Thrive.
          </p>

          <p className="px-2 pt-3 text-xl">
            Made by{" "}
            <a
              target="_blank"
              href="https://github.com/mihai888nextlab"
              className="text-primary"
            >
              Mihai Gorunescu
            </a>{" "}
            and{" "}
            <Link
              target="_blank"
              href="https://github.com/crististg"
              className="text-primary"
            >
              Cristi Stiegelbauer
            </Link>
          </p>
        </div>

        <div className="text-white p-10 w-fit h-[200px] absolute right-0 text-right text-xl px-[30px] mt-[35px]">
          ©2025 TaskHive
          <div className="mt-7">
            <Link
              href="https://github.com/mihai888nextlab/taskhive"
              className="hover:text-primary transition-colors duration-300 text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              View TaskHive on GitHub
            </Link>
          </div>
          <nav className="mt-3 text-white">
            <Link
              href="/contact"
              className="m-3 hover:text-primary transition-colors duration-300"
            >
              Contact
            </Link>
            <a
              target="_blank"
              href="https://drive.google.com/file/d/12ue5y65thsPObFLDn4PQFR94dA3rxMyf/view?usp=sharing"
              className="m-3 hover:text-primary transition-colors duration-300"
            >
              Documentation
            </a>
            <Link
              href="/help"
              className="m-3 hover:text-primary transition-colors duration-300"
            >
              Help
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
