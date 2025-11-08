"use client";
import UserDashboard from "@/components/Dashboard/UserDashboardMain";
import { UserAuth } from "@/app/context/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPageMain";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Session from "supertokens-auth-react/recipe/session";
import { useRouter } from "next/navigation";

export default function Home() {
  const authContext = UserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const sessionExists = await Session.doesSessionExist();
        setIsLoggedIn(sessionExists);
        if (sessionExists) {
          router.push("/studies");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <LandingPage />;
}