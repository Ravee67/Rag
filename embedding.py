from langchain_huggingface import HuggingFaceEmbeddings

# Load the embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Embedding model loaded!")

# Test embedding
text = "The Constitution of India"

vector = embeddings.embed_query(text)

print("Vector length:", len(vector))
print("First 10 values:", vector[:10])