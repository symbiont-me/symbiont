"use client";
import {
  ReactNode,
  useContext,
  createContext,
  useState,
  useEffect,
} from "react";
import { User } from "../../types";
import { signOut } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";

type AuthContextType = {
  user: User | null;
  userSignOut: () => void;
  isAuthLoading: boolean;
  userToken: string | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const sessionExists = await Session.doesSessionExist();
        if (!sessionExists) {
          setUser(null);
          setIsAuthLoading(false);
          return;
        }

        const accessToken = await Session.getAccessToken();
        setUserToken(accessToken ?? null);
        
        // If you need to get user info, do it here
        // const userId = await Session.getUserId();
        // setUser({ id: userId, ... });
        
        setIsAuthLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuthLoading(false);
      }
    }

    initAuth();
  }, []);

  async function userSignOut() {
    try {
      await signOut();
      setUser(null);
      setUserToken(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, userSignOut, isAuthLoading, userToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// NOTE must be used in a client side component, server side would give an error "UserAuth is not a function"
export const UserAuth = () => {
  return useContext(AuthContext);
};
