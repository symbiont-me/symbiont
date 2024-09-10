import Navbar from "./Navbar";
import Hero from "./Hero";
import FAQ from "./FAQ";
import Footer from "../Footer";
import { Divider } from "@mui/material";
import "./styles.css";
import { UserAuth } from "@/app/context/AuthContext";

const LandingPageMain = () => {
  const authContext = UserAuth();
  function handleSignout() {
    if (!authContext) {
      return;
    }
    authContext.googleSignOut();
  }
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <Divider />

      <div className="flex flex-grow flex-col">
        <div className="flex h-full flex-col md:flex-row">
          <Hero />
          <button onClick={handleSignout}>logout</button>
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
