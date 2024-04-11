import React from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
// import SlideShow from "./Carousel";

const slides = [
  { src: "/slides/slide1.jpg", alt: "symbiont writer" },
  { src: "/slides/slide2.jpg", alt: "symbiont pdf viewer" },
  { src: "/slides/slide3.jpg", alt: "symbiont video viewer" },
  { src: "/slides/slide4.jpg", alt: "symbiont add resources" },
];

const Hero = () => {
  return (
    <div className="w-full  h-full flex flex-row">
      <div className="w-1/2 h-full flex flex-col  items-center mt-20">
        <div className="p-20">
          <h1 className="text-black font-extrabold text-4xl mb-2">
            Open Source AI-Powered Research Tool
          </h1>
          <h4 className="mb-4 mt-4">Free to use with API Key</h4>

          <Button
            variant="outlined"
            sx={{ width: "220px" }}
            className="flex justify-between items-center"
          >
            <div className="border-r-2 border-slate-400 pr-2">
              <Image
                src="/logos/google-logo.svg"
                width={20}
                height={20}
                alt="google-sign-in"
              />
            </div>
            <span className="mx-auto ml-12">Log in</span>
            <div className="mr-8"></div>
          </Button>
        </div>
      </div>

      <div className="w-full h-full p-10 flex flex-col justify-center items-center">
        <div style={{ position: "relative", width: "100%", height: "80%" }}>
          <Image
            src="/slides/slides-1.jpg"
            alt="Description of the image"
            layout="fill"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
