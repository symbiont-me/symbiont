import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getUrl } from "@/firebase/utils";
import { createFileName } from "@/firebase/utils";

export async function uploadToFirebaseStorage(
  file: File,
): Promise<{ fileKey: string; fileName: string , downloadUrl: string}> {
  // create root reference
  const storage = getStorage();
  if (!(file instanceof File)) {
    throw new Error("Invalid file type. Expected instance of File.");
  }
  try {
    const fileRef = ref(storage, createFileName(file));

    const res = await uploadBytes(fileRef, file);
    const downloadLink = await getUrl(fileRef.fullPath);
    return { fileKey: fileRef.fullPath, fileName: fileRef.name , downloadUrl: downloadLink};
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading file to Firebase Storage");
  }
}
