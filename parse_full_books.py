import sys
import unicodedata
import re
import json
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

def clean_text(t):
    if not t:
        return ""
    t = unicodedata.normalize('NFKD', t)
    t = (t.replace('\ufb00', 'ff')
          .replace('\ufb01', 'fi')
          .replace('\ufb02', 'fl')
          .replace('\ufb03', 'ffi')
          .replace('\ufb04', 'ffl')
          .replace('’', "'")
          .replace('‘', "'")
          .replace('“', '"')
          .replace('”', '"')
          .replace('', "'"))
    return t

print("Checking books extraction capabilities...")
r_inter = PdfReader(r'C:\Users\melis\Downloads\English Collocations in Use Intermediate.pdf')
r_adv = PdfReader(r'C:\Users\melis\Downloads\English Collocations in Use Advanced.pdf')

print(f"Intermediate pages: {len(r_inter.pages)}, Advanced pages: {len(r_adv.pages)}")
