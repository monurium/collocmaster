from pypdf import PdfReader
import re

reader = PdfReader(r'C:\Users\melis\Downloads\English Collocations in Use Intermediate.pdf')

matched = []
for u in range(1, 61):
    p = (u - 1) * 2 + 9
    text = reader.pages[p].extract_text()
    for l in text.split('\n'):
        l = l.strip()
        m = re.match(r'^([a-zA-Z\s\/\,\'\-\(\)]+?)\s+([A-Z][a-zA-Z0-9\s\,\.\'\-\"\?\!\;\:\/]+[\.\?\!])$', l)
        if m:
            chunk = m.group(1).strip()
            sentence = m.group(2).strip()
            words = chunk.split()
            if 2 <= len(words) <= 5 and not chunk.startswith('Unit') and not chunk.startswith('English') and not chunk.startswith('Tip'):
                matched.append((u, chunk, sentence))

print(f"Total matched pairs in Intermediate: {len(matched)}")
for u, c, s in matched[:10]:
    print(f"Unit {u}: '{c}' -> '{s[:50]}...'")
