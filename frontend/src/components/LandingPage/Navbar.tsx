import React from "react";
import Image from "next/image";

import Divider from "@mui/material/Divider";
const Navbar = () => {
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
          <h3 className="font-semibold font-bold pl-8">Symbiont</h3>
        </div>
        <div className="bg-green-200 w-full flex flex-row justify-evenly items-center">
          <h3> Docs</h3>
          <h3> About</h3>
          <h3> Blog</h3>
          <h3> Contact</h3>
        </div>

        <div className="bg-blue-200 w-1/3 flex flex-row items-center justify-center">
          <h3> Sign In</h3>
        </div>
      </div>
      <Divider />
    </>
  );
};

export default Navbar;
