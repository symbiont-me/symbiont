import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import md5 from "md5";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
import { Pin } from "lucide-react";


let pinecone: Pinecone | null = null;

/**
 * Retrieves the singleton Pinecone client instance. If the client does not exist, it is created with the API key from environment variables.
 */
export const getPineconeClient = async () => {
  if (pinecone === null) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
  }

  return pinecone;
};
type PdfPage = {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
    };
  };
};

/**
 * Downloads a PDF file from S3, processes its content, and uploads the data to Pinecone.
 */
export async function loadS3DataIntoPinecone(fileKey: string) {
  console.log("Downloading file from S3");
  const file_name = await downloadFromS3(fileKey);
  if (file_name === null) {
    throw new Error("Could not download file from S3");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PdfPage[];
  // split the pdf into smaller chunks
  const documents = await Promise.all(pages.map(prepareDocument));
  // vectorize the documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));


  // create a pinecone client
  const pc = await getPineconeClient();
  const pineconeIndex = await pc.Index('chatpdf')
  console.log("Uploading vectors to Pinecone");
  // upload the vectors to pinecone
  const namespace = convertToAscii(fileKey);
  // TODO may need to fix this
  pineconeIndex.upsert(vectors );
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
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (e) {
    throw e;
  }
}

/**
 * Truncates a string to ensure it does not exceed a specified byte length.
 */
async function truncateStringByBytes(str: string, bytes: number) {
  const txtEncoder = new TextEncoder();
  return new TextDecoder("utf-8").decode(txtEncoder.encode(str).slice(0, bytes));
}

/**
 * Prepares a PDF page for uploading to Pinecone by cleaning its content and splitting it into smaller documents if necessary.
 */
async function prepareDocument(pdfPage: PdfPage) {
  let {
    pageContent,
    metadata: {
      loc: { pageNumber },
    },
  } = pdfPage;
  pageContent = pageContent.replace(/\n/g, "");
  // split the document
  const splitter = new RecursiveCharacterTextSplitter();
  const documents = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return documents;
}
