import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import "./styles.css";
import { UserAuth } from "@/app/context/AuthContext";
import CheckIcon from "@mui/icons-material/Check";
import Link from "next/link";
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlideIndex((prevSlideIndex) =>
        prevSlideIndex === slides.length - 1 ? 0 : prevSlideIndex + 1
      );
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div className="max-h-full  md:min-h-full p-12 w-full ">
        <h1 className="text-black font-extrabold text-5xl mb-8 leading-snug">
          Open Source AI-Powered Research Tool
        </h1>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center mb-2">
            <CheckIcon sx={{ color: "green" }} />
            <span className="ml-2">{feature}</span>
          </div>
        ))}
        <Link href="sign-in">
          <Button
            variant="contained"
            sx={{ width: "220px", marginTop: "30px" }}

            // onClick={handleSignIn}
          >
            Log in
          </Button>
        </Link>
      </div>
      <div className="md:min-w-[60%] w-full  ">
        <div className="relative w-full h-96 md:w-full md:h-full">
          {slides.map((slide, index) => (
            <Image
              key={index}
              src={slide.src}
              alt={slide.alt}
              fill
              objectFit="contain"
              className={`fade ${index === currentSlideIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero;
