"use client";
import { ReactNode, useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

type User = {
  // User Identifiers
  id: string; // Unique identifier for each user
  email?: string; // User's email address, optional
  phoneNumber?: string; // User's phone number, optional

  // Authentication Details
  timeJoined: Date; // Timestamp when the user account was created
  tenantIds?: string[]; // Identifiers for multi-tenancy support, optional
  thirdPartyLoginInfo?: any; // Details about any third-party authentication methods used, optional
  loginMethods: string[]; // Information about all the login methods associated with the user
  emailVerificationStatus: boolean; // Whether the user's email has been verified

  // Session Information
  accessToken: string; // Short-lived token for accessing protected resources
  refreshToken?: string; // Used to obtain new access tokens, optional

  // Custom Data
  metadata?: Record<string, any>; // Additional custom information that can be stored for each user, optional

  // Roles and Permissions
  defaultRole: string; // Primary role assigned to the user
  allowedRoles: string[]; // List of roles the user is permitted to have
};

import { signOut } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";

type AuthContextType = {
  user: User | null;
  googleSignIn: () => void;
  googleSignOut: () => void;
  isAuthLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if session exists and set user to null if it doesn't
  useEffect(() => {
    if (Session.getUserId() !== undefined) {
      setIsAuthLoading(true);
    }

    (async () => {
      if ((await Session.doesSessionExist()) === false) {
        setUser(null);
        setIsLoggedIn(false);
        setIsAuthLoading(false);
      }
    })();
  }, []);
  async function login() {
    try {
      const accessToken = await Session.getAccessToken();
      let response = await axios.post(`http://127.0.0.1:8000/auth/signin`, {
        formFields: [
          { id: "email", value: "retailstash@gmail.com" },
          { id: "password", value: "password_12345" },
        ],
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let responseData = response.data;
      setUser(responseData.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  }

  async function googleSignIn() {
    await login();
    try {
      let sessionResponse = await axios.get("http://127.0.0.1:8000/session-details");
      console.log("Session details:", sessionResponse.data);
    } catch (error) {
      console.error("Error fetching session details:", error);
    }
  }

  async function googleSignOut() {
    await signOut();
    setIsLoggedIn(false);
    window.location.href = "/";
  }

  useEffect(() => {
    if (isLoggedIn) {
      setIsAuthLoading(false);
    }
  }, [user, isLoggedIn]);

  return (
    <AuthContext.Provider value={{ user, googleSignIn, googleSignOut, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// NOTE must be used in a client side component, server side would give an error "UserAuth is not a function"
export const UserAuth = () => {
  return useContext(AuthContext);
};
