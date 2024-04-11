import React from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import LoginIcon from "@mui/icons-material/Login";
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

  const handleSignIn = () => {
    if (!authContext) {
      return;
    }
    try {
      authContext.googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };
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
            <React.Fragment>
              <Link
                key={item.title}
                href={item.link}
                className="p-2 font-semibold hover:text-blue-500"
              >
                <Button variant="text" sx={{ color: "black" }}>
                  {" "}
                  {item.title}
                </Button>
              </Link>
            </React.Fragment>
          ))}
        </div>

        <div className="w-1/3 flex flex-row items-center justify-center">
          <Button onClick={handleSignIn} variant="contained">
            Sign Up
            <LoginIcon sx={{ marginLeft: "4px" }} />
          </Button>
        </div>
      </div>
      <Divider />
    </>
  );
};

export default Navbar;
