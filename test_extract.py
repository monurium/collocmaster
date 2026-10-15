from pypdf import PdfReader
import re

reader = PdfReader(r'C:\Users\melis\Downloads\English Collocations in Use Intermediate.pdf')

def get_page_text(p_num):
    if p_num - 1 < len(reader.pages):
        return reader.pages[p_num - 1].extract_text()
    return ""

print("Testing text retrieval from Unit 6 (page 20):")
print(get_page_text(20)[:500])
