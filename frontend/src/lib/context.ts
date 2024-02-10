import { Pinecone } from "@pinecone-database/pinecone";
import { removeNonAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string,
) {
  try {
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index(process.env.PINECONE_INDEX_NAME!);
    const namespace = pineconeIndex.namespace(removeNonAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export const getContext = async (query: string, fileKey: string) => {
  const queryEmbeddings = await getEmbeddings(query);
  const queryResponse = await getMatchesFromEmbeddings(
    queryEmbeddings,
    fileKey,
  );

  // Assuming the matches are in a property called `results`
  const filteredMatches = queryResponse.filter((match) => match.score! > 0.7);
  //  console.log(filteredMatches);

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = filteredMatches.map((match) => {
    const metadata = match.metadata as Metadata;
    return {
      text: metadata.text,
      pageNumber: metadata.pageNumber,
    };
  });
  // joins the text from embeddings together
  const combinedContext = docs
    .map((doc) => doc.text.replace(/\n/g, " "))
    .join(" ")
    .substring(0, 3000);

  return combinedContext;
};
