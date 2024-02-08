"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LogIn } from "lucide-react";
import UserDashboard from "@/components/Dashboard/UserDashboardMain";
import { UserAuth } from "@/app/context/AuthContext";

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
    console.log(authContext.user.uid);
    return <UserDashboard userId={authContext.user.uid} />;
  }

  return (
    // TODO Create LandingPage component
    <div className="w-screen min-h-screen bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">
              Mistah Kurtz - he dead.
            </h1>
          </div>
          <div className="flex mt-2"></div>
          <div className="w-full mt-4">
            {
              <Link href="/sign-in">
                <Button onClick={handleSignIn}>
                  {" "}
                  Login to get started
                  <LogIn className="w-4 h-4 ml-2 " />
                </Button>
              </Link>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
