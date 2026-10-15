import os
import sys
import json
import re
import time
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
    print("Hata: .env dosyasında DEEPSEEK_API_KEY bulunamadı!", flush=True)
    sys.exit(1)

CACHE_FILE = 'deepseek_enriched_cache.json'
SEED_FILE = 'src/data/seedData.ts'

# Load existing cache
cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Önceden zenginleştirilmiş {len(cache)} kollokasyon önbellekten yüklendi.", flush=True)
    except Exception as e:
        print("Önbellek okuma hatası:", e, flush=True)
        cache = {}

# Parse current seedData.ts to get all collocations
with open(SEED_FILE, 'r', encoding='utf-8') as f:
    ts_text = f.read()

# Extract json array from ts file
match = re.search(r'export const SEED_COLLOCATIONS: Collocation\[\] = (\[.*?\]);', ts_text, re.DOTALL)
if not match:
    print("Hata: SEED_COLLOCATIONS bulunamadı!", flush=True)
    sys.exit(1)

all_collocations = json.loads(match.group(1))
print(f"Mevcut toplam {len(all_collocations)} kollokasyon işleme hazır.", flush=True)

# Group by unit
units_map = {}
for col in all_collocations:
    key = f"{col.get('level', 'Intermediate')}_{col.get('unitNumber', 1)}"
    if key not in units_map:
        units_map[key] = {
            "level": col.get('level', 'Intermediate'),
            "unitNumber": col.get('unitNumber', 1),
            "unitTitle": col.get('unitTitle', f"Unit {col.get('unitNumber', 1)}"),
            "items": []
        }
    units_map[key]["items"].append(col)

sorted_unit_keys = sorted(units_map.keys(), key=lambda k: (0 if 'Intermediate' in k else 1, int(k.split('_')[1])))
print(f"Toplam {len(sorted_unit_keys)} ünite bulundu.", flush=True)

def call_deepseek_batch(unit_info, batch_items):
    prompt_items = []
    for c in batch_items:
        prompt_items.append({
            "id": c["id"],
            "chunk": c["chunk"],
            "unitNumber": c.get("unitNumber"),
            "unitTitle": c.get("unitTitle")
        })

    prompt = f"""You are a master lexicographer and Cambridge ESL curriculum designer for 'English Collocations in Use' (Intermediate & Advanced).
For each collocation listed below from Unit {unit_info['unitNumber']}: "{unit_info['unitTitle']}" ({unit_info['level']}):

Generate high-yield study data with:
1. Accurate, natural, nuance-rich Turkish meaning ('meaning').
2. Collocation type ('type': must be one of 'verb-noun', 'adj-noun', 'adv-adj', 'phrase').
3. 2 to 4 natural English synonyms or close equivalent collocations in 'synonyms' (e.g. for 'make an effort' -> ['put in effort', 'strive', 'try hard', 'exert oneself']).
4. 1 to 3 realistic learner pitfalls/false collocations in 'commonMistakes' (e.g. 'do an effort' -> 'make an effort').
5. EXACTLY 4 to 5 DISTINCT, NATURAL, REALISTIC English sentences (CEFR B2-C1 level) showing this collocation in diverse real-world contexts (conversational, workplace/business, academic, and daily life).
   For EACH example:
   - 'sentence': The complete English sentence.
   - 'clozeSentence': The sentence with the exact collocation replaced by '___' (3 underscores).
   - 'missingWord': The exact collocation chunk.

Input Collocations:
{json.dumps(prompt_items, ensure_ascii=False, indent=2)}

Return STRICT JSON ONLY as a list of objects matching this schema:
[
  {{
    "id": "...",
    "chunk": "...",
    "type": "verb-noun",
    "meaning": "Türkçe anlamı ve açıklaması...",
    "synonyms": ["synonym 1", "synonym 2", "synonym 3"],
    "commonMistakes": ["yanlış kullanım (açıklama)", ...],
    "examples": [
      {{
        "sentence": "Full example sentence 1.",
        "clozeSentence": "Sentence with ___ blank.",
        "missingWord": "..."
      }},
      ... (4-5 distinct sentences)
    ]
  }}
]
Do not include any markdown quotes or code fences."""

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
            'temperature': 0.35,
            'max_tokens': 8192
        }).encode('utf-8')
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                content = res['choices'][0]['message']['content'].strip()
                if content.startswith('```'):
                    content = content.split('\n', 1)[1]
                    if content.endswith('```'):
                        content = content.rsplit('```', 1)[0]
                content = content.strip()
                parsed = json.loads(content)
                return parsed
        except Exception as e:
            print(f"    [Deneme {attempt+1}/3] Hata: {e}", flush=True)
            time.sleep(3 * (attempt + 1))
    return None

def save_cache():
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def update_seed_file():
    updated_count = 0
    for col in all_collocations:
        cid = col["id"]
        if cid in cache:
            enr = cache[cid]
            col["meaning"] = enr.get("meaning", col["meaning"])
            if enr.get("type"):
                col["type"] = enr.get("type")
            if enr.get("synonyms"):
                col["synonyms"] = enr.get("synonyms")
            if enr.get("commonMistakes"):
                col["commonMistakes"] = enr.get("commonMistakes")
            if enr.get("examples") and len(enr["examples"]) >= 3:
                col["examples"] = enr["examples"]
                updated_count += 1

    ts_code = f"""import {{ Collocation }} from '../types';

/**
 * DeepSeek AI Enriched Cambridge English Collocations in Use Corpus
 * Contains 4 to 5 authentic, contextual example sentences per collocation,
 * accurate cloze blanks, nuanced Turkish translations, and common learner mistakes.
 * Total Collocations: {len(all_collocations)}
 */
export const SEED_COLLOCATIONS: Collocation[] = {json.dumps(all_collocations, ensure_ascii=False, indent=2)};
"""
    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_code)
    print(f">> {updated_count} kollokasyon 4-5 zengin örnekle güncellenerek seedData.ts kaydedildi.", flush=True)

# Determine units to process
arg = sys.argv[1] if len(sys.argv) > 1 else "5"
max_units = len(sorted_unit_keys) if arg == "all" else int(arg)

print(f"\n========================================================", flush=True)
print(f" DeepSeek ile Zenginleştirme Başlatılıyor (Hedef: {max_units} Ünite)", flush=True)
print(f" Her kollokasyona 4-5 farklı örnek cümle, cloze testi & Türkçe anlam eklenecek.", flush=True)
print(f"========================================================\n", flush=True)

processed_units = 0
for u_idx, u_key in enumerate(sorted_unit_keys):
    if processed_units >= max_units:
        break

    u_data = units_map[u_key]
    items = u_data["items"]

    need_enrich = [
        c for c in items
        if c["id"] not in cache
        or len(cache[c["id"]].get("examples", [])) < 4
        or "synonyms" not in cache[c["id"]]
    ]

    if not need_enrich:
        print(f"[{u_idx+1}/{len(sorted_unit_keys)}] Unit {u_data['unitNumber']}: {u_data['unitTitle']} zaten zenginleştirilmiş.", flush=True)
        continue

    print(f"[{u_idx+1}/{len(sorted_unit_keys)}] Unit {u_data['unitNumber']} ({u_data['level']}): \"{u_data['unitTitle']}\" ({len(need_enrich)} kollokasyon)", flush=True)

    # Chunk in sub-batches of 5 items
    BATCH_SIZE = 5
    for b_i in range(0, len(need_enrich), BATCH_SIZE):
        sub_batch = need_enrich[b_i : b_i + BATCH_SIZE]
        sub_names = ", ".join([c["chunk"] for c in sub_batch])
        print(f"  -> Alt grup {b_i//BATCH_SIZE + 1} ({len(sub_batch)} kelime: {sub_names})...", flush=True)
        result = call_deepseek_batch(u_data, sub_batch)
        if result and isinstance(result, list):
            for item in result:
                cid = item.get("id")
                if cid:
                    cache[cid] = item
            save_cache()
            print(f"    ✓ {len(result)} adet kaydedildi.", flush=True)
        else:
            print(f"    ✗ Alt grup için yanıt alınamadı.", flush=True)
        time.sleep(0.5)

    processed_units += 1
    # Save seed file after each unit so progress is immediately live
    update_seed_file()

print("\nSeçilen tüm üniteler başarıyla tamamlandı!", flush=True)
