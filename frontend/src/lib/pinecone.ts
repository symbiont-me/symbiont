import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import md5 from "md5";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
import { downloadFromStorage as downloadfromFirebase } from "@/firebase/downloadFromStorage";
import { deleteFileFromFolder } from "@/firebase/downloadFromStorage";

/**
 * Retrieves the single Pinecone client instance. If the client does not exist, it is created with the API key from environment variables.
 */
export const getPineconeClient = async () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};
type PdfPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

/**
 * Downloads a PDF file from Firebase storage, processes its content, and uploads the data to Pinecone.
 * TODO handle audio file transcripts as well
 * TODO fix Pincone error: Namespaces names can only be ASCII-printable characters. Try again with a different name.
 */
export async function loadS3DataIntoPinecone(fileKey: string) {
  console.log("Downloading file from firebase");
  const fileName = await downloadfromFirebase(fileKey);
  if (fileName === null) {
    throw new Error("Could not download file from Firebase Storage");
  }
  console.log("loading pdf into memory" + fileName);
  const loader = new PDFLoader(fileName);
  const pages = (await loader.load()) as PdfPage[];

  // delete the temp file from storage
  await deleteFileFromFolder(fileName);

  // split the pdf into smaller chunks
  const documents = await Promise.all(pages.map(prepareDocument));
  console.log("Embedding documents");
  /* Flatten the array of documents and map each document to the embedDocument function
   which generates a vector representation for it. The Promise.all ensures that we wait
   for all the embeddings to be generated before proceeding. */
  const vectors = await Promise.all(documents.flat().map(embedDocument));
  console.log("Uploading vectors to Pinecone");
  // create a pinecone client
  const client = await getPineconeClient();
  const pineconeIndex = await client.index(process.env.PINECONE_INDEX_NAME!);
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
  // TODO fix PineconeBadRequestError: Upsert into uploads/1707587437769_1_Designing Data-Intensive Applications - Martin Kleppmann_Extracted.pdf failed. Namespaces names can only be ASCII-printable characters. Try again with a different name
  await namespace.upsert([...vectors]);
  console.log("Vectors uploaded to Pinecone");
  return documents[0]; // NOTE some other value might be better here
}

/**
 * Generates a vector representation of a document's content and creates a unique hash ID for it.
 */
async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);

    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (e) {
    console.error("Error embedding document");
    throw e;
  }
}

/**
 * Truncates a string to ensure it does not exceed a specified byte length.
 */
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

/**
 * Prepares a PDF page for uploading to Pinecone by cleaning its content and splitting it into smaller documents if necessary.
 */
async function prepareDocument(pdfPage: PdfPage) {
  let { pageContent, metadata } = pdfPage;
  pageContent = pageContent.replace(/\n/g, "");
  // split the document
  const splitter = new RecursiveCharacterTextSplitter();
  // TODO try removing await
  const truncatedText = await truncateStringByBytes(pageContent, 36000);
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncatedText,
      },
    }),
  ]);

  return docs;
}
