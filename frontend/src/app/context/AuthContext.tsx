"use client"
import { app, auth } from "../../firebase/config";
import { onAuthStateChanged, User  } from "firebase/auth";
import { useContext } from "react";
import { useEffect, useState, createContext , ReactNode} from "react";
import {useRouter} from "next/navigation";

type AuthContextType = {
  user: User | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: {children: ReactNode}) => {
const router = useRouter();
  console.log("AuthProvider");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  console.log(user);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/");
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

    if (loading) {
      return <div>Loading...</div>;
    }
  return (


    // TODO if user is not signed in, redirect to /sign-in
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
