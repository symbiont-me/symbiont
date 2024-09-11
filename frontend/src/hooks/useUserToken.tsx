import { useState, useEffect } from "react";
import Session from "supertokens-auth-react/recipe/session";

function useUserToken() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAccessToken() {
      try {
        const accessToken = await Session.getAccessToken();
        if (accessToken) {
          setUserToken(accessToken);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAccessToken();
  }, []);

  return { userToken, loading, error };
}

export default useUserToken;
