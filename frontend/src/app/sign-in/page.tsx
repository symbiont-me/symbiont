"use client";
import React, { useEffect } from "react";
import { UserAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/Auth/AuthForm";
import MaterialForm from "@/components/Auth/AuthFormMaterial";
function SignInPage() {
  return (
    <div>
      <AuthForm />
    </div>
  );
}

export default SignInPage;
