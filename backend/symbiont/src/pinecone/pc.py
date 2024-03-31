from hashlib import md5
from typing import List
from symbiont.src.models import PineconeRecord, DocumentPage
from symbiont.src.fb.storage import download_from_firebase_storage, delete_local_file
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import NLTKTextSplitter, RecursiveCharacterTextSplitter
from hashlib import md5

from langchain_openai import OpenAIEmbeddings
from symbiont.src.models import EmbeddingModels, CohereTextModels
import os
from dotenv import load_dotenv
from langchain_core.documents import Document
from typing import List, Union
from langchain_community.embeddings import CohereEmbeddings
from . import pc_index
from ..models import EmbeddingModels, StudyResource
from firebase_admin import firestore
import nltk
from pydantic import BaseModel
from ..models import Study
from typing import Union
from .. import logger
from langchain_voyageai import VoyageAIEmbeddings
import cohere
import time
from fastapi import HTTPException

nltk.download("punkt")

load_dotenv()


# TODO import all these from __init__.py
cohere_api_key = os.getenv("CO_API_KEY")
api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")
pinecone_endpoint = os.getenv("PINECONE_API_ENDPOINT")
voyage_api_key = os.getenv("VOYAGE_API_KEY")

co = cohere.Client(api_key=cohere_api_key or "")


class VectorInDB(BaseModel):
    source: str
    page: int
    text: str


class PineconeService:
    """
    resource_identifier is the unique identifier for the resource in the database
    """

    def __init__(
        self,
        study_id: str,
        resource_identifier: str,
        user_uid=None,
        user_query="",
        resource_download_url=None,
    ):
        self.user_uid = user_uid
        self.user_query = user_query
        self.study_id = study_id
        self.resource_identifier = resource_identifier
        self.download_url = resource_download_url
        self.db = firestore.client()
        self.embed = OpenAIEmbeddings(
            model=EmbeddingModels.OPENAI_TEXT_EMBEDDING_3_SMALL, dimensions=1536
        )

        # TODO use model based on user's settings and api key provided
        # TODO fix missing param error
        # NOTE: has a rate limit per seconds (I think) so it throws an error if you try to use it too much
        # self.embed = VoyageAIEmbeddings(
        #     voyage_api_key=voyage_api_key, model=EmbeddingModels.VOYAGEAI_2_LARGE
        # )

        self.nltk_text_splitter = NLTKTextSplitter()
        self.recursive_text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=14000,
            chunk_overlap=20,
            length_function=len,
            is_separator_regex=False,
        )

        self.text_splitter = self.nltk_text_splitter
        self.db_vec_refs = {}

    def get_vectors_from_db(self):
        vec_ref = self.db.collection("users").document(self.user_uid)
        vec_data = vec_ref.get().to_dict()
        # TODO fix type error
        if "vectors" not in vec_data:
            return None
        return vec_data["vectors"]

    # TODO refactor: confusing
    # TODO fix type errors
    async def create_vec_ref_in_db(self):
        if self.db_vec_refs is None:
            raise ValueError("No vectors to save in the database")
        try:
            db = firestore.client()
            vec_ref = db.collection("users").document(self.user_uid)
            # Retrieve the current data to avoid overwriting
            current_data = vec_ref.get().to_dict()
            # Initialize 'vectors' as a mapping if it doesn't exist
            if "vectors" not in current_data:
                current_data["vectors"] = {}
            # Update the document with the new mapping of vectors under the specific resource identifier
            identifier = self.resource_identifier
            if identifier not in current_data["vectors"]:
                current_data["vectors"][identifier] = {}
            current_data["vectors"][identifier].update(self.db_vec_refs)

            # Save the updated data back to Firestore
            vec_ref.set(current_data)
            logger.info(f"Updated vectors in Firestore for {self.resource_identifier}")
            return vec_ref
        except Exception as e:
            logger.error(f"Error updating vectors in Firestore: {str(e)}")
            return None

    # make this generic it should take various types of resources
    async def embed_document(
        self, doc: Union[DocumentPage, Document]
    ) -> PineconeRecord:

        vec = await self.embed.aembed_query(doc.page_content)
        hash = md5(doc.page_content.encode("utf-8")).hexdigest()
        self.db_vec_refs[hash] = VectorInDB(**doc.metadata).dict()
        return PineconeRecord(id=hash, values=vec, metadata=doc.metadata)

    def delete_vectors_from_pinecone(self, namespace):
        try:
            if pc_index:
                pc_index.delete(delete_all=True, namespace=namespace)
                logger.info(f"Deleted namespace from Pinecone {namespace}")
        except Exception as e:
            print(f"Error deleting namespace {namespace}: {str(e)}")

    async def handle_pdf_resource(self, file_path: str):
        if file_path is not None and file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
            pages = [DocumentPage(**page.dict()) for page in loader.load_and_split()]

            docs = []
            for page in pages:
                prepared_pages = await self.prepare_pdf_for_pinecone(page)
                docs.extend(prepared_pages)

            vecs = [await self.embed_document(doc) for doc in docs]
            logger.info(f"Created {len(vecs)} vectors for {self.resource_identifier}")
            return vecs
        return []

    async def add_file_resource_to_pinecone(self):
        s = time.time()
        if self.download_url is None:
            logger.error("Download URL must be provided to prepare file resource")
            raise ValueError("Download URL must be provided to prepare file resource")

        file_path = await download_from_firebase_storage(
            self.resource_identifier, self.download_url
        )

        # handle pdf only for now
        if file_path is not None and file_path.endswith(".pdf"):
            vecs = await self.handle_pdf_resource(file_path)
            logger.info(f"Created {len(vecs)} vectors for {self.resource_identifier}")
            await self.upload_vecs_to_pinecone(vecs)
            await self.create_vec_ref_in_db()
            await delete_local_file(file_path)
        elapsed = time.time() - s
        logger.info("Took (%s) s to upload the file", elapsed)

    # TODO rename this function as it is used for more than just webpages

    async def upload_webpage_to_pinecone(self, resource, content):
        split_texts = self.text_splitter.create_documents([content])
        docs = [
            # TODO fix duplicate page_content
            DocumentPage(
                page_content=split_text.page_content,
                metadata={
                    "text": split_text.page_content,
                    "source": self.resource_identifier,
                    "page": 0,  # there are no pages in a webpage or plain text
                },
                type=resource.category,
            )
            for split_text in split_texts
        ]
        s = time.time()
        vecs = [await self.embed_document(doc) for doc in docs]
        logger.info(f"Created {len(vecs)} vectors for {self.resource_identifier}")
        elapsed = time.time() - s
        logger.info("Vectorisation took (%s) s", elapsed)
        await self.upload_vecs_to_pinecone(vecs)
        await self.create_vec_ref_in_db()

    async def get_relevant_vectors(self, top_k=25):
        if self.resource_identifier is None or self.user_query is None:
            raise ValueError(
                "Resource and user query must be provided to get chat context"
            )

        pc_results = self.search_pinecone_index(self.resource_identifier, top_k)
        logger.info(
            f"Found {len(pc_results.matches)} matches from resource {self.resource_identifier}"
        )

        vec_metadata = []
        for match in pc_results.matches:
            vec_data = self.get_vectors_from_db()
            # logger.info(f"VEC DATA FROM DB: {vec_data}")
            if vec_data is None:
                return ""
            resource_vecs = vec_data[self.resource_identifier]
            vec_metadata.append(resource_vecs[match.id])

        return vec_metadata

    def rerank_context(self, context):
        # TODO get the text from the reranked type
        reranked_context = co.rerank(
            query=self.user_query,
            documents=context,
            top_n=3,
            model=CohereTextModels.COHERE_RERANK_V2,
        )
        reranked_text = ""
        for text in reranked_context.results:
            reranked_text += text.document.get("text", "")
        logger.info(f"Context vectors reranked")
        return reranked_text

    async def get_single_chat_context(self):
        context = await self.get_relevant_vectors()
        if context is None:
            return ""
        reranked_context = self.rerank_context(context)
        return reranked_context

    async def get_combined_chat_context(self):
        db = firestore.client()
        all_resource_identifiers = []
        study_dict = db.collection("studies").document(self.study_id).get().to_dict()

        if study_dict is None:
            raise HTTPException(status_code=404, detail="No such document!")
        resources = study_dict.get("resources", [])

        if resources is None:
            raise HTTPException(status_code=404, detail="No Resources Found")
        # get the identifier for each resource
        all_resource_identifiers = [
            resource.get("identifier") for resource in resources
        ]
        logger.info(f"Resource Identifiers: {all_resource_identifiers}")
        # get the context for each resource
        combined_vecs = []
        for identifier in all_resource_identifiers:
            # NOTE need to set the global resource identifier because get_relevant_vectors uses it
            self.resource_identifier = identifier
            vecs = await self.get_relevant_vectors(top_k=10)
            combined_vecs.extend(vecs)
        logger.info(f"Combined Context: {len(combined_vecs)}")
        return self.rerank_context(combined_vecs)

    async def upload_yt_resource_to_pinecone(
        self, resource: StudyResource, content: str
    ):
        # NOTE this is causing problems, it seems to be cutting off the text
        # content = truncate_string_by_bytes(content, 10000)
        split_texts = self.text_splitter.create_documents([content])
        # NOTE should be able to use the Document from langchain_core.documents everywhere
        docs = [
            DocumentPage(
                page_content=split_text.page_content,
                metadata={
                    "text": split_text.page_content,
                    "source": self.resource_identifier,
                    "page": 0,  # there are no pages in a youtube video
                },
                type=resource.category,
            )
            for split_text in split_texts
        ]
        vecs = [await self.embed_document(doc) for doc in docs]
        logger.info(f"Created {len(vecs)} vectors for {self.resource_identifier}")
        await self.upload_vecs_to_pinecone(vecs)
        await self.create_vec_ref_in_db()

    async def upload_vecs_to_pinecone(self, vecs: List[PineconeRecord]):
        metadata = (
            {}
        )  # TODO metadata is stored in the db. It should not be stored in Pinecone. Should have a better way to do this
        formatted_vecs = [(vec.id, vec.values, metadata) for vec in vecs]
        if pc_index is None:
            logger.error("Pinecone index is not initialized")
            raise ValueError("Pinecone index is not initialized")
        pc_index.upsert(vectors=formatted_vecs, namespace=self.resource_identifier)

    def truncate_string_by_bytes(self, string, num_bytes):
        encoded_string = string.encode("utf-8")
        truncated_string = encoded_string[:num_bytes]
        return truncated_string.decode("utf-8", "ignore")

    async def prepare_pdf_for_pinecone(
        self, pdf_page: DocumentPage
    ) -> List[DocumentPage]:
        page_content = pdf_page.page_content.replace("\n", "")
        page_content = self.truncate_string_by_bytes(page_content, 10000)
        split_texts = self.text_splitter.create_documents([page_content])
        docs = [
            DocumentPage(
                page_content=split_text.page_content,
                metadata={
                    "text": split_text.page_content,
                    "source": self.resource_identifier,
                    "page": pdf_page.metadata["page"],
                },
                type=pdf_page.type,
            )
            for split_text in split_texts
        ]

        return docs

    def get_query_embedding(self) -> List[float]:
        vec = self.embed.embed_query(self.user_query)
        return vec

    def search_pinecone_index(self, file_identifier: str, top_k=25):
        query_embedding = self.get_query_embedding()
        if pc_index is None:
            raise ValueError("Pinecone index is not initialized")
        query_matches = pc_index.query(
            vector=query_embedding,
            top_k=top_k,
            namespace=file_identifier,
            include_metadata=True,
        )

        return query_matches

    def add_resource_to_pinecone(self):
        pass
