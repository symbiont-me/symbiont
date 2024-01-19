import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter"



let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (pinecone === null) {
    pinecone = new Pinecone(
      {
        apiKey: process.env.PINECONE_API_KEY || "",
      }
    )
  }

  return pinecone;
}
type PdfPage = {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
    }
  }
}

export async function loadS3DataIntoPinecone(fileKey: string) {
  console.log("Downloading file from S3")
  const file_name = await downloadFromS3(fileKey);
  if (file_name === null) {
    throw new Error("Could not download file from S3")
  }
  const loader = new PDFLoader(file_name);
  const pages = await loader.load() as PdfPage[]
  // split the pdf into smaller chunks
  return pages;
}

// helper function
async function truncateStringByBytes(str: string, bytes: number) {
  const txtEncoder = new TextEncoder();
  return new TextDecoder('utf-8').decode(txtEncoder.encode(str).slice(0, bytes));
}


async function prepareDocument(pdfPage: PdfPage) {
  let { pageContent, metadata: { loc: { pageNumber } } } = pdfPage;
  pageContent = pageContent.replace(/\n/g, "");
  // split the document 
  const splitter = new RecursiveCharacterTextSplitter();
  const documents = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber,
        text: truncateStringByBytes(pageContent, 36000)
      },
    })
  ])

  return documents;
}
