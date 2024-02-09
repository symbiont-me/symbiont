import { getStorage, ref, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { promises as fs } from "fs";
import {app} from "@/firebase/config";

// TODO initialise the firebase app somewhere on the upper level of the app
// TODO make the file is secured and only accessible to the user who uploaded it

async function getUrl(fileKey: string): Promise<string> {
  const storage = getStorage(app);
  const gsReference = ref(storage, `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/uploads/${fileKey}`);
  try {
    const url = await getDownloadURL(gsReference);
    console.log("URL: ", url);
    return url;
  } catch (error) {
    console.log(error);
    throw new Error("Error downloading file from Firebase Storage");
  }
}



export async function downloadFromStorage(url: string): Promise<string> {
  try {
    const urlResponse = await getUrl(url);
    const res = await axios.get(urlResponse, {
      responseType: "blob",
    });

    const blob = res.data;
    const fileName = `/tmp/symbiont-${Date.now().toString()}.pdf`;

    // Write the file to disk
    await fs.writeFile(fileName, blob);
    console.log(`File downloaded and saved as ${fileName}`);
    return fileName;
  } catch (error) {
    console.error("Error downloading or saving the file:", error);
    throw error;
  }
}
