import { auth } from "../config";
import { UserAuthDetails } from "@/types";

// TODO handle error properly
// TODO add return types
async function signIn({ email, password }: UserAuthDetails) {
  let result = undefined,
    error = undefined;
  try {
    result = await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = e;
  }
  return { result, error };
}

export default signIn;
