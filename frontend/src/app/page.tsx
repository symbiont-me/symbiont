"use client";
import Link from "next/link";
import Button from "@mui/material/Button";
import { LogIn } from "lucide-react";
import UserDashboard from "@/components/Dashboard/UserDashboardMain";
import { UserAuth } from "@/app/context/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPageMain";

export default function Home() {
  const authContext = UserAuth();

  if (!authContext) {
    throw new Error("AuthContext is not available");
  }
  const handleSignIn = () => {
    try {
      authContext.googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  if (authContext.user && authContext.user.uid) {
    return (
      <div className="flex flex-col h-full">
        <UserDashboard />
      </div>
    );
  }

  return (
    // TODO Create LandingPage component
    <>
      <LandingPage />
    </>
  );
}
