"use client";
import UserDashboard from "@/components/Dashboard/UserDashboardMain";
import { UserAuth } from "@/app/context/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPageMain";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import Session from "supertokens-auth-react/recipe/session";

export default function Home() {
  const authContext = UserAuth();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const sessionExists = await Session.doesSessionExist();
        setIsLoggedIn(sessionExists);
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return <>{isLoggedIn ? <UserDashboard /> : <LandingPage />}</>;
}