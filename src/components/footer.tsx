import { Kanit } from "next/font/google";

const kanit = Kanit({
    subsets: ["latin"],
    weight: ["400", "900"],
});  

export default function Footer() {
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
  
    return (
        <footer>
            <div className="w-screen h-fit border-t-2 border-accent relative">
                <div className="m-[30px] p-10 w-fit h-[250px] absolute left-0 top-0">
                    <a href="/">
                        <img src="logo.png" alt="logo" className="h-[40px]" />
                    </a>

                    <p className={kanit.className+" px-2 pt-5 text-xl text-white"}>
                        Organize. Achive. Thrive.
                    </p>

                    <p className={kanit.className+" px-2 pt-3 text-xl"}>
                        Made by <a href="https://github.com/mihai888nextlab" className="underline text-primary">Mihai Gorunescu</a> and <a href="https://github.com/crististg" className="underline text-primary">Cristi Stiegelbauer</a>
                    </p>
                </div>

                <div className="text-white p-10 w-fit h-[200px] absolute right-0 text-right text-xl px-[30px] mt-[80px]">
                    ©2025 TaskHive
                    <nav className="mt-[20px] text-white">
                        <a href="" className="m-3 hover:text-primary transition-colors duration-300">Contact</a>
                        <a href="" className="m-3 hover:text-primary transition-colors duration-300">Documentation</a>
                        <a href="" className="m-3 hover:text-primary transition-colors duration-300">Help</a>
                        <a href="" className="hover:text-primary transition-colors duration-300">Product</a>
                    </nav>
                </div>
            </div>
        </footer>
    );
  }
  