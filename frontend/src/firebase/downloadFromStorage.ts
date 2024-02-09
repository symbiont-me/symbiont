import axios from "axios";
import * as fs from "fs";
import { getUrl } from "@/firebase/utils";

// TODO initialise the firebase app somewhere on the upper level of the app
// TODO make the file is secured and only accessible to the user who uploaded it

export async function downloadFromStorage(url: string): Promise<string> {
  try {
    const fileExtension = url.split(".").pop(); // probably wrong
    const fileName = `symbiont-${Date.now().toString()}.${fileExtension}`;
    const fileStream = fs.createWriteStream(fileName);
    const downloadLink = await getUrl(url);
    const res = await axios.get(downloadLink, {
      responseType: "stream",
    });

    res.data.pipe(fileStream);
    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });
    console.log(`File downloaded and saved as ${fileName}`);
    return fileName;
  } catch (error) {
    console.error("Error downloading or saving the file:", error);
    throw error;
  }
}

export async function deleteFileFromFolder(fileName: string) {
  try {
    await fs.promises.unlink(fileName);
    console.log(`Deleted file: ${fileName}`);
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
  }
}
