"use client";
import {
  ReactNode,
  useContext,
  createContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import { User } from "../../types";

import { signOut } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";
type AuthContextType = {
  user: User | null;
  googleSignIn: () => void;
  googleSignOut: () => void;
  isAuthLoading: boolean;
  userToken: string | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);
// TODO this needs to be refactored to remove unnecessary information
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
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

  useEffect(() => {
    async function fetchAccessToken() {
      const accessToken = await Session.getAccessToken();
      if (accessToken) {
        setUserToken(accessToken);
      }
    }
    fetchAccessToken();
  }, []);

  // @note if access token is null should be an error
  async function login() {
    try {
      let response = await axios.post(`http://127.0.0.1:8000/auth/signin`, {
        formFields: [
          { id: "email", value: "retailstash@gmail.com" },
          { id: "password", value: "password_12345" },
        ],
        headers: {
          Authorization: `Bearer ${userToken}`,
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
      let sessionResponse = await axios.get(
        "http://127.0.0.1:8000/session-details"
      );
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
    <AuthContext.Provider
      value={{ user, googleSignIn, googleSignOut, isAuthLoading, userToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// NOTE must be used in a client side component, server side would give an error "UserAuth is not a function"
export const UserAuth = () => {
  return useContext(AuthContext);
};
