"use client";

import UserDashboard from "@/components/Dashboard/UserDashboardMain";
import { UserAuth } from "@/app/context/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPageMain";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import axios from "axios";
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

  async function logIn() {
    const userToken = await authContext?.user?.getIdToken();

    if (!userToken) {
      return;
    }
    const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
    const body = {};
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };

    try {
      const res = await axios.post(endpoint, body, { headers });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  }

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

  {
    authContext?.user && logIn();
  }

  return <>{authContext?.user ? <UserDashboard /> : <LandingPage />}</>;
}
