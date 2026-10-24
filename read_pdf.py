from pypdf import PdfReader

pdf_path = "Documents/tesla_annual_report.pdf"

reader = PdfReader(pdf_path)

print("Number of pages:", len(reader.pages))

text = reader.pages[0].extract_text()

print("\nFirst page text:\n")
print(text[:2000])