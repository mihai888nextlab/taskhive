export default function Footer() {
  return (
    <footer>
      <div className="w-screen h-fit border-t-2 border-accent relative">
        <div className="m-[30px] p-10 w-fit h-[250px] absolute left-0 top-0">
          <a href="/">
            <img src="logo.png" alt="logo" className="h-[40px]" />
          </a>

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
            <a
              target="_blank"
              href="https://github.com/crististg"
              className="text-primary"
            >
              Cristi Stiegelbauer
            </a>
          </p>
        </div>

        <div className="text-white p-10 w-fit h-[200px] absolute right-0 text-right text-xl px-[30px] mt-[35px]">
          ©2025 TaskHive
          <div className="mb-5 mt-3">
            <a
              href="https://github.com/mihai888nextlab/taskhive"
              className="hover:text-primary transition-colors duration-300 text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              View TaskHive on GitHub
            </a>
          </div>
          <nav className="mt-3 text-white">
            <a
              href="/contact"
              className="m-3 hover:text-primary transition-colors duration-300"
            >
              Contact
            </a>
            <a
              target="_blank" href="https://docs.google.com/document/d/1Tp27zznysO2PBVL6t8UodaK5t6Mt793h/edit?usp=sharing&ouid=102360779176306286727&rtpof=true&sd=true"
              className="m-3 hover:text-primary transition-colors duration-300"
            >
              Documentation
            </a>
            <a
              href="/help"
              className="m-3 hover:text-primary transition-colors duration-300"
            >
              Help
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}