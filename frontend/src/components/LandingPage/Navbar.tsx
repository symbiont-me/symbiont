import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { UserAuth } from "@/app/context/AuthContext";
import Link from "next/link";
const navItems = [
  {
    title: "Docs",
    link: "/#",
  },
  {
    title: "About",
    link: "/#",
  },
  {
    title: "Blog",
    link: "/#",
  },
  {
    title: "Contact",
    link: "/#",
  },
];

const Navbar = () => {
  const authContext = UserAuth();

  return (
    <>
      <div className="flex flex-row h-20 w-screen">
        <div className=" w-1/3 flex flex-row p-2 pl-20 items-center ">
          <Image
            src="/logos/symbiont-logo-1.jpg"
            alt="logo"
            height={40}
            width={40}
          />
          <h3 className="font-semibold pl-8">Symbiont</h3>
        </div>
        <div className="w-full flex flex-row justify-evenly items-center">
          {navItems.map((item) => (
            <React.Fragment key={item.title}>
              <Link
                href={item.link}
                className="p-2 font-semibold hover:text-blue-500"
              >
                <Button
                  variant="ghost"
                  className="text-black text-lg font-normal capitalize"
                >
                  {item.title}
                </Button>
              </Link>
            </React.Fragment>
          ))}
        </div>

        <div className="w-1/3 flex flex-row items-center justify-center">
          <Link href="/sign-in">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign Up
              <LogIn className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full border-b border-border" />
    </>
  );
};

export default Navbar;
