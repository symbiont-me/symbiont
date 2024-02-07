import { auth } from "../config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { UserAuthDetails } from "@/types";

// TODO handle error properly
// TODO add return types
async function signUp({ email, password }: UserAuthDetails) {
  let result = undefined,
    error = undefined;
  try {
    result = await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export default signUp;
