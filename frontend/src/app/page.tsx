"use client";

import UserDashboard from "@/components/Dashboard/UserDashboardMain";
import { UserAuth } from "@/app/context/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPageMain";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
export default function Home() {
  const authContext = UserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming `UserAuth` provides a way to check if the auth status is being resolved
    const checkAuthStatus = async () => {
      try {
        if (!authContext) {
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [authContext, authContext?.user, authContext?.user?.uid]);
  if (!authContext) {
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <CircularProgress />
    </div>;
  }
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return <>{authContext?.user ? <UserDashboard /> : <LandingPage />}</>;
}
