
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import ollama

# 1. Load the embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 2. Connect to the existing ChromaDB
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)


def ask_rag(question: str):
    # 3. Retrieve relevant chunks from the Tesla report
    results = vectorstore.similarity_search(
        question,
        k=5
    )

    # 4. Handle empty retrieval
    if not results:
        message = (
            "I could not find this information in the "
            "retrieved sections of the Tesla 2025 Annual Report."
        )

        return {
            "answer": message,
            "rag_answer": message,
            "ai_answer": message,
            "sources": [],
            "insufficient_evidence": True
        }

    # 5. Build context from retrieved document chunks
    context = "\n\n".join(
        doc.page_content for doc in results
    )

    # 6. Generate the RAG answer using only report context
    rag_prompt = f"""
You are a question-answering assistant for Tesla's 2025 Annual Report.

Answer the question using ONLY the context provided below.

Rules:
- Use facts supported by the context.
- Preserve the correct year, figures, and units.
- Never invent or guess numbers.
- Do not confuse vehicle production with vehicle deliveries.
- Do not calculate vehicle counts from revenue.
- If the context does not contain the answer, say:
  "I could not find this information in the retrieved sections
  of the Tesla 2025 Annual Report."

Context:
{context}

Question:
{question}

Give a concise, direct answer.
"""

    rag_response = ollama.chat(
        model="qwen2.5:3b",
        messages=[
            {
                "role": "user",
                "content": rag_prompt
            }
        ]
    )

    rag_answer = rag_response["message"]["content"].strip()

    # 7. Generate a separate, more explanatory AI answer.
    # It must still use the same retrieved report context.
    ai_prompt = f"""
You are an AI assistant explaining information from Tesla's
2025 Annual Report.

Use the supplied report context to answer the question.
Explain the result in clear, natural language and add useful
context only when supported by the report.

Rules:
- Do not introduce facts or numbers absent from the context.
- Do not contradict the RAG answer.
- If the report context does not answer the question,
  clearly say that the information could not be found.
- Keep the explanation concise.

Retrieved report context:
{context}

Question:
{question}

RAG answer:
{rag_answer}

Now provide a separate explanatory AI answer.
Do not simply copy the RAG answer word for word.
"""

    ai_response = ollama.chat(
        model="qwen2.5:3b",
        messages=[
            {
                "role": "user",
                "content": ai_prompt
            }
        ]
    )

    ai_answer = ai_response["message"]["content"].strip()

    # 8. Return source passages for the frontend
    sources = []

    for doc in results:
        sources.append({
            "page": doc.metadata.get(
                "page_label",
                doc.metadata.get("page")
            ),
            "content": doc.page_content,
            "source": doc.metadata.get(
                "source",
                "Tesla Annual Report"
            )
        })

    # 9. Return BOTH answers using the expected API fields
    return {
        "answer": rag_answer,
        "rag_answer": rag_answer,
        "ai_answer": ai_answer,
        "sources": sources,
        "insufficient_evidence": False
    }
