import { Pinecone } from "@pinecone-database/pinecone";
import { getPineconeClient } from "./pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export const getMatchesFromEmbeddings = async (
  embeddings: number[],
  fileKey: string
) => {
  const pc = await getPineconeClient();
  const index = pc.index("cheddar");

  try {
    const namespace = convertToAscii(fileKey);
    /* Perform a query to retrieve the top 5 closest vectors from the Pinecone index.
         `embeddings`: The query vector for which we are finding similar vectors.
         `topK`: The number of closest vectors to retrieve.
         `includeMetadata`: Indicates whether to include the metadata in the query results.
         `filter`: An object to filter the results based on metadata. Here, we are filtering
         by `namespace`, which is derived from the `fileKey` to ensure we only get results
         within the same namespace. 
    */
    const queryResult = await index.query({
      vector: embeddings,
      topK: 5,
      includeMetadata: true,
      filter: { namespace },
    });
    return queryResult;
  } catch (error) {
    console.error("Error querying Pinecone index");
    throw error;
  }
};


const getContext = async (query: string, fileKey: string) => {
    const queryEmbeddings = await getEmbeddings(query);
    const queryResponse = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
    
    

    // Assuming the matches are in a property called `results`
    const filteredMatches = queryResponse.matches.filter((match) => match.score! > 0.7);

    type Metadata = {
        text: string;
        pageNumber: number;
    }

    let docs = filteredMatches.map((match) => {
        const metadata = match.metadata as Metadata;
        return {
            text: metadata.text,
            pageNumber: metadata.pageNumber,
        }
    })

    return docs.join("\n").substring(0, 3000);

}