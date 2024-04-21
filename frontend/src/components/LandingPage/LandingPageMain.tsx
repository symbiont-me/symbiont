import Navbar from "./Navbar";
import Hero from "./Hero";
import FAQ from "./FAQ";
import Footer from "../Footer";
import { Divider } from "@mui/material";
import "./styles.css";

const LandingPageMain = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <Divider />

      <div className="flex flex-grow flex-col">
        <div className="flex h-full flex-col md:flex-row">
          <Hero />
        </div>
        <Divider />
        <div className="flex min-h-full w-full flex-col ">
          <FAQ />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPageMain;
