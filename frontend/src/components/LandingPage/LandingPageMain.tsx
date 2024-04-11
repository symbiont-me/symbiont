import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import FAQ from "./FAQ";
const LandingPageMain = () => {
  return (
    <div className="w-screen h-screen min-h-screen flex flex-col sm:h-full overflow-x-hidden">
      <Navbar />
      <Hero />
      <FAQ />
    </div>
  );
};

export default LandingPageMain;
