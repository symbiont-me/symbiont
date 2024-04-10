import React from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
const Hero = () => {
  return (
    <div className="w-full  h-full flex flex-row">
      <div className="w-full h-full flex flex-col">
        <h1>Open Source AI-Powered Research Tool</h1>
        <h4>Free to use with API Key</h4>

        <Button
          variant="outlined"
          sx={{ width: "250px" }}
          className="flex flex-row"
        >
          <div className="w-1/4 mr-8">
            <Image
              src="/logos/google-logo.svg"
              width={20}
              height={20}
              alt="google-sign-in"
            />
          </div>
          Log in{" "}
        </Button>
      </div>

      <div></div>
      <div className="bg-red-400 w-full h-full"></div>
    </div>
  );
};

export default Hero;
