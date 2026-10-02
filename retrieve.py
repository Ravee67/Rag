from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Load the same embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Connect to existing ChromaDB
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

# Question
question = "What is Article 21 of the Constitution of India?"

# Retrieve chunks with similarity scores
results = vectorstore.similarity_search_with_score(
    question,
    k=5
)

print("Question:")
print(question)

print("\nRetrieved chunks:\n")

for i, (doc, score) in enumerate(results, start=1):
    print(f"--- Result {i} ---")
    print("Page:", doc.metadata.get("page_label"))
    print("Score:", score)
    print(doc.page_content[:1000])
    print()