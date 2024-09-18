import cohere
import os
from .. import logger
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain.schema import Document
from typing import List, Dict, Union, Tuple
from symbiont.models import CohereTextModels


class Citation:
    def __init__(self, text: str, source: str, page: int):
        self.text = text
        self.source = source
        self.page = page


class RerankerService:
    def __init__(self, reranker_name: str):
        self.api_key = os.getenv("RERANKER_API_KEY")
        if self.api_key is None:
            raise ValueError("Please set the RERANKER_API_KEY environment variable")
        self.reranker_name = reranker_name
        self.reranker = self._init_reranker()

    def _init_reranker(self):
        if self.reranker_name == "cohere":
            logger.info("Reranker: Cohere")
            return cohere.Client(api_key=self.api_key)
        elif self.reranker_name == "huggingface":
            logger.info("Reranker: HuggingFace CrossEncoder")
            model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
            return CrossEncoderReranker(model=model, top_n=3)
        else:
            raise ValueError(f"Reranker {self.reranker_name} not supported")

    def rerank_context(
        self, context: List[Dict[str, str]], query: str
    ) -> Union[Tuple[str, List[Citation]], Tuple[None, None]]:
        if not context:
            return None, None

        if self.reranker_name == "cohere":
            reranked_context = self.reranker.rerank(
                query=query,
                documents=context,
                top_n=3,
                model=CohereTextModels.COHERE_RERANK_V2,
            )
            reranked_indices = [r.index for r in reranked_context.results]
            reranked_text = "".join([r.document.get("text", "") for r in reranked_context.results])
        elif self.reranker_name == "huggingface":
            documents = [Document(page_content=doc["text"]) for doc in context]
            reranked_context = self.reranker.compress_documents(query=query, documents=documents)
            reranked_indices = [i for i, _ in enumerate(reranked_context)]
            reranked_text = "".join([doc.page_content for doc in reranked_context])
        else:
            raise ValueError(f"Reranker {self.reranker_name} not supported")

        citations = [
            Citation(
                text=context[i].get("text", ""),
                source=context[i].get("source", ""),
                page=int(context[i].get("page", 0)),
            )
            for i in reranked_indices
        ]
        citations_dict = [c.__dict__ for c in citations]

        return (reranked_text, citations_dict)
