import { app } from "@/firebase/config";
import { getStorage, ref } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";
import { removeNonAscii } from "@/lib/utils";
export async function getUrl(fileKey: string): Promise<string> {
  const storage = getStorage(app);
  const gsReference = ref(
    storage,
    `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${fileKey}`,
  );
  try {
    const url = await getDownloadURL(gsReference);
    return url;
  } catch (error) {
    console.error(error);
    throw new Error("Error downloading file from Firebase Storage");
  }
}

// create file name
export function createFileName(file: File): string {
  const cleanedFileName = removeNonAscii(file.name);
  console.log("cleanedFileName", cleanedFileName);
  return `uploads/${Date.now()}_${cleanedFileName}`;
}
