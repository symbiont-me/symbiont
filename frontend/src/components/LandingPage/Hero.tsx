import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import "./styles.css";
import { UserAuth } from "@/app/context/AuthContext";
import CheckIcon from "@mui/icons-material/Check";
const slides = [
  { src: "/slides/slide1.jpg", alt: "symbiont writer" },
  { src: "/slides/slide2.jpg", alt: "symbiont pdf viewer" },
  { src: "/slides/slide3.jpg", alt: "symbiont video viewer" },
  { src: "/slides/slide4.jpg", alt: "symbiont add resources" },
  { src: "/slides/slide5.jpg", alt: "symbiont settings" },
];

const features = [
  "Free to use with API Key",
  "Large number of LLMs available including Open Source ones",
  "Search through text, video and audio files",
  "Fact-check information quickly and easily across multiple sources",
];

const Hero = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
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
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlideIndex((prevSlideIndex) =>
        prevSlideIndex === slides.length - 1 ? 0 : prevSlideIndex + 1,
      );
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row md:h-full">
      {" "}
      <div className="w-1/2 h-full flex flex-col  items-center mt-4 ml-12">
        <div className="p-20">
          <h1 className="text-black font-extrabold text-5xl mb-8 leading-snug">
            Open Source AI-Powered Research Tool
          </h1>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center mb-2">
              <CheckIcon sx={{ color: "green" }} />
              <span className="ml-2">{feature}</span>
            </div>
          ))}
          <Button
            variant="outlined"
            sx={{ width: "220px", marginTop: "30px" }}
            className="flex justify-between items-center"
            onClick={handleSignIn}
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
      <div className="w-full min-h-[80%] p-10 flex flex-col justify-center items-center">
        <div
          style={{
            position: "relative",
            width: "95%",
            height: "100%",
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`fade ${index === currentSlideIndex ? "active" : ""}`}
              style={{ position: "absolute", width: "100%", height: "100%" }}
            >
              <Image src={slide.src} alt={slide.alt} layout="fill" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
