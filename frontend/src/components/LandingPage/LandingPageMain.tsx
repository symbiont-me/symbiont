import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";

const LandingPageMain = () => {
  return (
    <div className="w-screen h-screen min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <Hero />
    </div>
  );
};

export default LandingPageMain;
