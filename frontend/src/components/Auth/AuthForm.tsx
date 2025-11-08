"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import Session from "supertokens-auth-react/recipe/session";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormData = z.infer<typeof schema>;

export default function AuthForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const sessionExists = await Session.doesSessionExist();
      setIsLoggedIn(sessionExists);
      // Redirect to home if logged in
      if (sessionExists) {
        window.location.href = "/";
      }
    }

    checkSession();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleAuth = async () => {
    const endpoint = isSignUp ? "signup" : "signin";
    setIsLoading(true);
    setAuthError("");
    try {
      const supertokensAuthUrl =
        process.env.NEXT_PUBLIC_SUPERTOKENS_API_ENDPOINT;

      console.log("Auth URL:", supertokensAuthUrl);
      const response = await axios.post(
        `${supertokensAuthUrl}/auth/${endpoint}`,
        {
          formFields: [
            { id: "email", value: email },
            { id: "password", value: password },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data;
      if (responseData.status === "OK") {
        window.location.href = "/";
      } else if (responseData.status === "WRONG_CREDENTIALS_ERROR") {
        setAuthError("Invalid credentials. Please try again.");
      }

      if (isSignUp) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setAuthError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">Symbiont</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Open Source AI-Powered Research Tool
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Transform your research workflow with AI-powered document analysis, 
            chat functionality, and multi-LLM support.
          </p>
          <div className="space-y-4">
            <div className="flex items-center text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3" />
              <span>Free to use with your API keys</span>
            </div>
            <div className="flex items-center text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3" />
              <span>Large number of LLMs available</span>
            </div>
            <div className="flex items-center text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3" />
              <span>Search through text, video and audio files</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">
                {isSignUp ? "Create your account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {isSignUp 
                  ? "Enter your details to create your Symbiont account" 
                  : "Enter your credentials to access your account"
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...register("email")}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      {...register("password")}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </>
                  ) : (
                    isSignUp ? "Create account" : "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter>
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-gray-600 hover:text-gray-900"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
