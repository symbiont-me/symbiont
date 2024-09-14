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

import Alert from "@mui/material/Alert";

import Session from "supertokens-auth-react/recipe/session";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import axios from "axios";

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
    try {
      const supertokensAuthUrl =
        process.env.NEXT_PUBLIC_SUPERTOKENS_WEBSITE_DOMAIN ||
        "http://127.0.0.1:8000";
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
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        {authError && <Alert severity="error">{authError}</Alert>}
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
                <Alert severity="error">{errors.email.message}</Alert>
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
                <Alert severity="error">{errors.password.message}</Alert>
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
            variant="outlined"
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
