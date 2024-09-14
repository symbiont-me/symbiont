import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";
import { UserAuth } from "@/app/context/AuthContext";
import { User } from "@/types";

const useAuthRedirect = () => {
  const router = useRouter();
  const authContext = UserAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkSession() {
      const sessionExists = await Session.doesSessionExist();
      setIsLoggedIn(sessionExists);
      setLoading(false);
      setUser(authContext?.user ?? null);

      if (!sessionExists) {
        router.push("/"); // Redirect to home if not logged in
      }
    }
    checkSession();
  }, [authContext, router]);

  return { isLoggedIn, loading, user };
};

export default useAuthRedirect;
