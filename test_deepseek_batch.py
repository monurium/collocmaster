import os
import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

# Read API key from .env
api_key = None
if os.path.exists('.env'):
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('DEEPSEEK_API_KEY='):
                api_key = line.split('=', 1)[1].strip()
                break

if not api_key:
    print("API Key not found in .env!")
    sys.exit(1)

test_items = [
    {"chunk": "make an effort", "unitNumber": 7, "unitTitle": "Everyday verbs 1: make and do"},
    {"chunk": "bitterly cold", "unitNumber": 6, "unitTitle": "Intensifying adverbs"},
    {"chunk": "cast doubt on", "unitNumber": 10, "unitTitle": "Synonyms and confusable words 1"}
]

prompt = f"""You are a master lexicographer for Cambridge 'English Collocations in Use'.
For each of the following collocations, generate rich study data including 4 to 5 distinct, high-quality, realistic English example sentences (B2/C1 level) across different contexts (conversational, workplace, academic).

Collocations:
{json.dumps(test_items, ensure_ascii=False, indent=2)}

Return a strict JSON list of objects matching this exact format:
[
  {{
    "chunk": "...",
    "unitNumber": 1,
    "unitTitle": "...",
    "type": "verb-noun" | "adj-noun" | "adv-adj" | "phrase",
    "meaning": "Türkçe doğal ve net anlamı...",
    "commonMistakes": ["yanlış kullanım 1", "yanlış kullanım 2"],
    "examples": [
      {{
        "sentence": "Full example sentence 1.",
        "clozeSentence": "Sentence with ___ in place of the chunk.",
        "missingWord": "..."
      }},
      ... (4-5 distinct sentences)
    ]
  }}
]
Do not wrap in markdown quotes if possible, output pure JSON only."""

req = urllib.request.Request(
    'https://api.deepseek.com/chat/completions',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    },
    data=json.dumps({
        'model': 'deepseek-chat',
        'messages': [
            {'role': 'system', 'content': 'You output strictly valid JSON without explanation or markdown blocks.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.3,
        'max_tokens': 2500
    }).encode('utf-8')
)

print("Calling DeepSeek API with 3 test collocations...")
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode('utf-8'))
        content = res['choices'][0]['message']['content'].strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1]
            if content.endswith('```'):
                content = content.rsplit('```', 1)[0]
        data = json.loads(content)
        print(f"Successfully generated {len(data)} items!")
        for item in data:
            print(f"\n--- {item['chunk']} ({item['type']}) ---")
            print(f"Anlam: {item['meaning']}")
            print(f"Hatalar: {item.get('commonMistakes')}")
            print(f"Örnek Cümle Sayısı: {len(item.get('examples', []))}")
            for i, ex in enumerate(item.get('examples', []), 1):
                print(f"  {i}. {ex['sentence']}")
                print(f"     Cloze: {ex['clozeSentence']}")
except Exception as e:
    print("API Error:", e)
