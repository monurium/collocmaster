import sys
import unicodedata
from pypdf import PdfReader
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

reader = PdfReader(r'C:\Users\melis\Downloads\English Collocations in Use Intermediate.pdf')

def clean_text(t):
    t = unicodedata.normalize('NFKD', t)
    # replace common ligatures
    t = t.replace('\ufb00', 'ff').replace('\ufb01', 'fi').replace('\ufb02', 'fl').replace('\ufb03', 'ffi').replace('\ufb04', 'ffl')
    t = t.replace('', "'")
    return t

print("Extracting units...")
unit_data = {}
for u in range(6, 61):
    book_page = (u - 1) * 2 + 6
    pdf_page = book_page + 4
    if pdf_page - 1 < len(reader.pages):
        raw = reader.pages[pdf_page - 1].extract_text()
        unit_data[u] = clean_text(raw)

print(f"Extracted {len(unit_data)} units successfully.")
with open("extracted_units.json", "w", encoding="utf-8") as f:
    json.dump(unit_data, f, ensure_ascii=False, indent=2)
print("Saved to extracted_units.json")
