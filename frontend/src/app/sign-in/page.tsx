"use client";
import React, { useEffect } from "react";
import { UserAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
function SignInPage() {
  const authContext = UserAuth();

  return (
    <div>
      <h1>Sign In</h1>
      {/* Form and other components will go here */}
    </div>
  );
}

export default SignInPage;
