import React from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import LoginIcon from "@mui/icons-material/Login";
import { UserAuth } from "@/app/context/AuthContext";
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
          <h3> Docs</h3>
          <h3> About</h3>
          <h3> Blog</h3>
          <h3> Contact</h3>
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
