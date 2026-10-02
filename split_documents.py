from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

pdf_path = "Documents/constitution.pdf"

loader = PyPDFLoader(pdf_path)
documents = loader.load()

print("Pages loaded:", len(documents))

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

chunks = text_splitter.split_documents(documents)

print("Number of chunks:", len(chunks))

print("\nFirst chunk:\n")
print(chunks[0].page_content)

print("\nFirst chunk metadata:\n")
print(chunks[0].metadata)