import { Auth } from "aws-sdk/clients/docdbelastic";
import { app, auth } from "../../firebase/config";
import { onAuthStateChanged, User  } from "firebase/auth";
import { useContext } from "react";
import { useEffect, useState, createContext , ReactNode} from "react";

type AuthContextType = {
  user: User | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: {children: ReactNode}) => {

  console.log("AuthProvider");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <AuthContext.Provider value={{ user }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
