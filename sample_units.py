from pypdf import PdfReader
import json

reader = PdfReader(r'C:\Users\melis\Downloads\English Collocations in Use Intermediate.pdf')

sample_units = [6, 7, 13, 22, 31, 32, 52, 56]

for u in sample_units:
    book_page = (u - 1) * 2 + 6
    pdf_page = book_page + 4
    txt = reader.pages[pdf_page - 1].extract_text()
    print(f"=== UNIT {u} (PDF page {pdf_page}, Book page {book_page}) ===")
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    print("\n".join(lines[:15]))
    print("-" * 50)
