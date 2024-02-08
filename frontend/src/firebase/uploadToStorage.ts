import { getStorage, ref, uploadBytes } from "firebase/storage";

function removeNonAscii(str: string): string {
  return str.replace(/[^\x00-\x7F]/g, "");
}

// create file name
function createFileName(file: File): string {
  const cleanedFileName = removeNonAscii(file.name);
  return `uploads/${Date.now()}_${cleanedFileName}`;
}

export async function uploadToFirebaseStorage(
  file: File,
): Promise<{ fileKey: string; fileName: string }> {
  // create root reference
  const storage = getStorage();
  if (!(file instanceof File)) {
    throw new Error("Invalid file type. Expected instance of File.");
  }
  try {
    const fileRef = ref(storage, createFileName(file));

    const res = await uploadBytes(fileRef, file);
    console.log("File uploaded successfully to Firebase Storage", fileRef);
    return { fileKey: fileRef.fullPath, fileName: fileRef.name };
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading file to Firebase Storage");
  }
}
