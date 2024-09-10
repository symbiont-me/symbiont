"use client";
import React, { useEffect } from "react";
import { UserAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
function SignInPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <AuthForm />
    </div>
  );
}

export default SignInPage;
