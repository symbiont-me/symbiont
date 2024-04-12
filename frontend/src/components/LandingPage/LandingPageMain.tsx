import Navbar from "./Navbar";
import Hero from "./Hero";
import FAQ from "./FAQ";
import Footer from "../Footer";
import { Divider } from "@mui/material";

const LandingPageMain = () => {
  return (
    <div className="flex md-screen flex-col overflow-x-hidden">
      <Navbar />
      <Divider />
      <Hero />
      <Divider />
      <div className="flex min-h-full w-full flex-col ">
        <FAQ />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPageMain;
