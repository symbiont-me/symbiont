"use client";
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
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";

SuperTokens.init({
  appInfo: {
    appName: "symbiont",
    apiDomain: "http://127.0.0.1:8000", // todo should come from env
    websiteDomain: "http://localhost:3003", // todo should come from env
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [EmailPassword.init(), Session.init()],
});

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

  useEffect(() => {
    async function checkSession() {
      const sessionExists = await Session.doesSessionExist();
      setIsLoggedIn(sessionExists);
    }
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      window.location.href = "/";
    }
  }, [isLoggedIn]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function fetchSessionDetails() {
    try {
      let response = await fetch("http://127.0.0.1:8000/session-details");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let data = await response.json();
      console.log("Session details:", data);
    } catch (error) {
      console.error("Error fetching session details:", error);
    }
  }

  // TODO fix event type issue
  const handleAuth = async (data: FormData, event) => {
    event.preventDefault();
    const endpoint = isSignUp ? "signup" : "signin";
    const response = await fetch(`http://127.0.0.1:8000/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formFields: [
          { id: "email", value: "retailstash@gmail.com" },
          { id: "password", value: "password_12345" },
        ],
      }),
    });

    const responseData = await response.json();
    if (responseData.status === "OK") {
      window.location.href = "/";
    }

    if (isSignUp) {
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <Typography variant="h5">
            {isSignUp ? "Sign Up to Symbiont" : "Sign In to Symbiont"}
          </Typography>
          <Typography variant="body2">
            Enter your details below to{" "}
            {isSignUp ? "create your account" : "access your account"}.
          </Typography>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
            <div className="space-y-2">
              <TextField
                id="email"
                type="email"
                label="Email"
                variant="outlined"
                fullWidth
                {...register("email")}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ""}
              />
              {errors.email && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <TextField
                id="password"
                type="password"
                label="Password"
                variant="outlined"
                fullWidth
                {...register("password")}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ""}
              />
              {errors.password && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.password.message}</AlertDescription>
                </Alert>
              )}
            </div>
            <Button type="submit" variant="contained" fullWidth>
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Link href="/" passHref>
              <Button
                variant="contained"
                fullWidth
                style={{ marginTop: "16px" }}
              >
                Back
              </Button>
            </Link>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full"
          >
            <Typography variant="body2">
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Typography>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
