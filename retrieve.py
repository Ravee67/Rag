
import re
from langchain_community.document_loaders import PyPDFLoader

# --------------------------------------------------
# 1. Load the original Tesla annual report
# --------------------------------------------------

pdf_path = "Documents/tesla_annual_report.pdf"

loader = PyPDFLoader(pdf_path)
documents = loader.load()

print("=" * 80)
print("TESLA ANNUAL REPORT - VEHICLE DELIVERY SEARCH")
print("=" * 80)
print("Total pages loaded:", len(documents))


# --------------------------------------------------
# 2. Search the extracted text
# --------------------------------------------------

keywords = [
    "consumer vehicles",
    "vehicle deliveries",
    "vehicles delivered",
    "delivered approximately",
    "produced approximately",
    "1.64 million",
    "1.66 million",
    "vehicle production",
    "deliveries in 2025",
]

matches = []

for page_index, document in enumerate(documents):
    original_text = document.page_content

    # Normalize whitespace and line breaks.
    text = re.sub(r"\s+", " ", original_text).strip()
    text_lower = text.lower()

    found_keywords = [
        keyword
        for keyword in keywords
        if keyword in text_lower
    ]

    # Also search pages mentioning vehicles and delivery/production.
    mentions_vehicle = "vehicle" in text_lower or "vehicles" in text_lower
    mentions_delivery = (
        "deliver" in text_lower
        or "production" in text_lower
        or "produced" in text_lower
    )

    if found_keywords or (mentions_vehicle and mentions_delivery):
        matches.append({
            "page": page_index + 1,
            "text": text,
            "keywords": found_keywords,
        })


# --------------------------------------------------
# 3. Display matching pages
# --------------------------------------------------

if matches:
    print("\nMatching pages:", len(matches))

    for result in matches:
        print("\n" + "=" * 80)
        print("PDF PAGE:", result["page"])
        print("Matched keywords:", result["keywords"])
        print("=" * 80)

        print(result["text"][:6000])

else:
    print("\nNo matching vehicle-related pages found.")
    print("Check the PDF filename and extracted document text.")


# --------------------------------------------------
# 4. Search every page for numerical delivery figures
# --------------------------------------------------

print("\n" + "=" * 80)
print("SEARCHING FOR NUMERICAL VEHICLE FIGURES")
print("=" * 80)

number_pattern = re.compile(
    r"\b\d+(?:\.\d+)?\s*(?:million|billion|thousand)\b",
    re.IGNORECASE,
)

for result in matches:
    numbers = number_pattern.findall(result["text"])

    if numbers:
        print(f"\nPage {result['page']}: {numbers}")


print("\n" + "=" * 80)
print("SEARCH COMPLETED")
print("=" * 80)
