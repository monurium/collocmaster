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
          .replace('\u2013', '-')
          .replace('\u2014', '-')
          .replace('\u2026', '...')
          .replace(' ', ' '))
    return re.sub(r'\s+', ' ', t).strip()

# Complete Table of Contents Mapping for Intermediate (Units 1 to 60)
INTERMEDIATE_UNITS = {
    1: "What is a collocation?",
    2: "Finding, recording and learning collocations",
    3: "Using your dictionary",
    4: "Types of collocation",
    5: "Register",
    6: "Intensifying adverbs",
    7: "Everyday verbs 1: make and do",
    8: "Everyday verbs 2: go, turn, get, become",
    9: "Everyday verbs 3: have, take, give, pay",
    10: "Synonyms and confusable words 1",
    11: "Synonyms and confusable words 2",
    12: "Metaphor",
    13: "Weather",
    14: "Travel",
    15: "Countryside",
    16: "Towns and cities",
    17: "People: character and behaviour",
    18: "People: physical appearance",
    19: "Families",
    20: "Relationships",
    21: "Houses, flats and rooms",
    22: "Eating and drinking",
    23: "Films and books",
    24: "Music",
    25: "Sport",
    26: "Health and illness",
    27: "Using the internet",
    28: "Study and learning",
    29: "Presentations",
    30: "Work",
    31: "Business",
    32: "Academic writing 1",
    33: "Academic writing 2",
    34: "Laws and punishments",
    35: "Crime",
    36: "News",
    37: "Money",
    38: "War and peace",
    39: "Global problems",
    40: "Time",
    41: "Sound",
    42: "Distance and size",
    43: "Colour and light",
    44: "Texture",
    45: "Taste and smell",
    46: "Number and frequency",
    47: "Movement and speed",
    48: "Change",
    49: "Ways of speaking",
    50: "Ways of walking",
    51: "Starting and finishing",
    52: "Talking about success and failure",
    53: "Talking about cause and effect",
    54: "Remembering and sensing",
    55: "Agreeing and disagreeing",
    56: "Talking about beliefs and opinions",
    57: "Deciding and choosing",
    58: "Claiming and denying",
    59: "Liking and disliking",
    60: "Praising and criticising"
}

print("Loading Intermediate PDF...")
reader_inter = PdfReader(r'C:\Users\melis\Downloads\English Collocations in Use Intermediate.pdf')

curriculum = []
seen_chunks = set()

def add_collocation(col):
    chunk_clean = col['chunk'].lower().strip()
    if not chunk_clean or chunk_clean in seen_chunks:
        return
    if len(chunk_clean) < 3 or len(chunk_clean.split()) > 6:
        return
    seen_chunks.add(chunk_clean)
    curriculum.append(col)

# 1. Parse tables from Intermediate
for unit_num in range(1, 61):
    p_num = (unit_num - 1) * 2 + 9
    if p_num >= len(reader_inter.pages):
        continue
    raw_text = reader_inter.pages[p_num].extract_text()
    raw_lines = raw_text.split('\n')
    unit_title = INTERMEDIATE_UNITS.get(unit_num, f"Unit {unit_num}")

    in_table = False
    for line in raw_lines:
        line_clean = clean_text(line)
        if not line_clean:
            continue
        if 'collocation example' in line_clean.lower():
            in_table = True
            continue
        if in_table:
            if line_clean.startswith('Tip') or line_clean.startswith('Exercises') or 'English Collocations in Use' in line_clean or line_clean.startswith('1 ') or line_clean.startswith('2 '):
                in_table = False
                continue

            # Check if line contains collocation and example sentence
            # Typically: "<collocation> <Sentence starting with Capital letter or I'm/We're/The...>"
            m = re.match(r'^([a-zA-Z\s\/\,\'\-\(\)]+?)\s+([A-Z][a-zA-Z0-9\s\,\.\'\-\"\?\!\;\:\/]+)$', line_clean)
            if m:
                chunk = m.group(1).strip()
                sentence = m.group(2).strip()

                # Clean chunk if it has / e.g. "make a change / changes" -> "make a change"
                primary_chunk = chunk.split('/')[0].split('(')[0].strip()
                if len(primary_chunk.split()) < 2:
                    continue

                # Detect type
                first_w = primary_chunk.split()[0].lower()
                c_type = 'phrase'
                if first_w in ['make', 'do', 'have', 'take', 'give', 'pay', 'break', 'catch', 'keep', 'see', 'go', 'get', 'turn', 'become', 'set', 'run', 'hold', 'lose']:
                    c_type = 'verb-noun'
                elif first_w in ['highly', 'utterly', 'bitterly', 'deeply', 'strongly', 'strictly', 'ridiculously', 'blissfully', 'patently']:
                    c_type = 'adv-adj'
                elif len(primary_chunk.split()) == 2:
                    c_type = 'adj-noun'

                # Cloze sentence
                cloze = sentence
                pattern = re.compile(re.escape(primary_chunk), re.IGNORECASE)
                if pattern.search(cloze):
                    cloze = pattern.sub('___', cloze)
                else:
                    words = primary_chunk.split()
                    if len(words) >= 2 and words[1] in cloze:
                        cloze = cloze.replace(words[1], '___')
                    else:
                        cloze = f"It is common to ___ in this context."

                col_id = f"col_u{unit_num:02d}_{len(curriculum)+1:03d}"
                add_collocation({
                    "id": col_id,
                    "chunk": primary_chunk,
                    "type": c_type,
                    "cefrLevel": "B1" if unit_num < 15 else "B2",
                    "category": "academic" if unit_num in [6, 28, 32, 33] else ("business" if unit_num in [29, 30, 31, 37] else "everyday"),
                    "meaning": f"[Unit {unit_num}: {unit_title}] İngilizce doğal kollokasyon kalıbı.",
                    "collocates": [],
                    "commonMistakes": [f"do {primary_chunk[5:]}" if primary_chunk.startswith("make ") else (f"make {primary_chunk[3:]}" if primary_chunk.startswith("do ") else "")],
                    "examples": [
                        {
                            "sentence": sentence,
                            "clozeSentence": cloze,
                            "missingWord": primary_chunk
                        }
                    ],
                    "unitNumber": unit_num,
                    "unitTitle": unit_title,
                    "level": "Intermediate"
                })

print(f"Extracted {len(curriculum)} collocations from Intermediate tables.")

# 2. Add high-impact collocations from our curated dictionary for all units that had non-table presentations
with open('src/data/seedData.ts', 'r', encoding='utf-8') as f:
    existing_text = f.read()

json_match = re.search(r'export const SEED_COLLOCATIONS: Collocation\[\] = (\[[\s\S]*\]);', existing_text)
if json_match:
    existing_items = json.loads(json_match.group(1))
    print(f"Merging {len(existing_items)} existing curated items...")
    for item in existing_items:
        add_collocation(item)

print(f"Total collocations in curriculum so far: {len(curriculum)}")

# 3. Add Advanced units from English Collocations in Use Advanced
ADVANCED_UNITS = {
    1: "What is a collocation?",
    2: "Strong, fixed and weak collocations",
    3: "Grammatical categories of collocation",
    4: "Finding and working on collocations in texts",
    5: "Register",
    6: "Metaphor",
    7: "Intensifying and softening adverbs",
    8: "Make and verbs that mean make",
    9: "Communicating",
    10: "Collocations with play",
    30: "Regulations and authority",
    31: "The environment",
    32: "Town and country life",
    33: "Personal finance",
    34: "The economy",
    35: "Social issues",
    36: "Science and technology",
    37: "Health and medicine",
    38: "Travel and adventure",
    39: "Sport and leisure",
    40: "News and current affairs"
}

ADV_COLLOCS = [
    # Unit 6: Metaphor
    ("face the facts", "verb-noun", 6, "Metaphor", "You're never going to run in the Olympics. It's time you faced the facts.", "Acı gerçekleri kabul etmek"),
    ("shoulder the blame", "verb-noun", 6, "Metaphor", "Although others were also responsible, Alice decided to shoulder the blame.", "Suçu / sorumluluğu üstlenmek"),
    ("foot the bill", "verb-noun", 6, "Metaphor", "Choose what you like from the menu; the company is footing the bill.", "Hesabı / faturayı ödemek"),
    ("head a team", "verb-noun", 6, "Metaphor", "Jo heads a team of six researchers studying cancer treatments.", "Bir ekibe liderlik / başkanlık etmek"),
    ("keep someone on their toes", "phrase", 6, "Metaphor", "The new teacher really keeps everyone on their toes.", "Teyakkuzda / zinde tutmak"),
    ("have an eye for", "phrase", 6, "Metaphor", "She has an eye for a bargain when shopping for antiques.", "İyi anlamak, gözü keskin olmak"),
    ("go hand in hand with", "phrase", 6, "Metaphor", "Poverty often goes hand in hand with poor health.", "El ele gitmek, birlikte anılmak"),
    # Unit 7: Intensifying and Softening Adverbs
    ("spotlessly clean", "adv-adj", 7, "Intensifying and softening adverbs", "You should see her apartment; it is always spotlessly clean.", "Tertemiz, pırıl pırıl"),
    ("downright rude", "adv-adj", 7, "Intensifying and softening adverbs", "It was downright rude of Antonio to interrupt her while speaking.", "Açıkça ve fazlasıyla kaba"),
    ("thoroughly ashamed", "adv-adj", 7, "Intensifying and softening adverbs", "I hope he feels thoroughly ashamed of his disgraceful behaviour.", "Son derece utanmış"),
    ("blatantly obvious", "adv-adj", 7, "Intensifying and softening adverbs", "It is blatantly obvious that they are trying to hide the financial report.", "Apaçık ortada"),
    ("wildly inaccurate", "adv-adj", 7, "Intensifying and softening adverbs", "The claims made in the sensationalist tabloid were wildly inaccurate.", "Tamamen / vahim şekilde yanlış"),
    ("mildly surprised", "adv-adj", 7, "Intensifying and softening adverbs", "I was mildly surprised to hear that she had resigned from the board.", "Hafifçe şaşırmış"),
    ("faintly ridiculous", "adv-adj", 7, "Intensifying and softening adverbs", "He looked faintly ridiculous in that oversized velvet suit.", "Hafif gülünç / tuhaf"),
    # Unit 8: Make and verbs that mean make
    ("make a contribution", "verb-noun", 8, "Make and verbs that mean make", "She made a valuable contribution to the environmental project.", "Katkı sağlamak"),
    ("make a habit of", "verb-noun", 8, "Make and verbs that mean make", "Do not make a habit of postponing your study sessions.", "Alışkanlık haline getirmek"),
    ("turn a profit", "verb-noun", 8, "Make and verbs that mean make", "The small enterprise managed to turn a profit in its first year.", "Kâra geçmek"),
    # Unit 9: Communicating
    ("talk business", "verb-noun", 9, "Communicating", "Let's grab a coffee first and then talk business.", "İş konuşmak"),
    ("get straight to the point", "phrase", 9, "Communicating", "We only have ten minutes, so please get straight to the point.", "Doğrudan sadede gelmek"),
    ("strike up a conversation", "verb-noun", 9, "Communicating", "It is surprisingly easy to strike up a conversation with locals.", "Sohbet başlatmak"),
    # Unit 30: Regulations & Authority
    ("minimise danger", "verb-noun", 30, "Regulations and authority", "Strict safety procedures were introduced to minimise danger on the site.", "Tehlikeyi en aza indirmek"),
    ("grant permission", "verb-noun", 30, "Regulations and authority", "The local council granted permission for the new housing development.", "Resmi izin vermek"),
    ("faceless bureaucrats", "adj-noun", 30, "Regulations and authority", "Decisions should not be left to faceless bureaucrats in distant offices.", "Ruhsuz / soyut bürokratlar"),
    # Unit 31: Environment
    ("dump waste", "verb-noun", 31, "The environment", "Factories are strictly forbidden to dump waste into the river.", "Atık boşaltmak"),
    ("searing heat", "adj-noun", 31, "The environment", "The marathon runners struggled through the searing heat of the desert.", "Kavurucu sıcak"),
    ("offset carbon emissions", "verb-noun", 31, "The environment", "Many airlines now allow passengers to offset carbon emissions.", "Karbon salınımını dengelemek"),
    # Unit 34: Economy
    ("curb inflation", "verb-noun", 34, "The economy", "The reserve bank raised interest rates to curb inflation.", "Enflasyonu dizginlemek"),
    ("safeguard interests", "verb-noun", 34, "The economy", "The treaty was designed to safeguard the national interests of both nations.", "Çıkarları korumak"),
    ("plummeting profits", "adj-noun", 34, "The economy", "The airline suffered due to skyrocketing fuel costs and plummeting profits.", "Dibe vuran kârlar"),
    ("sluggish economy", "adj-noun", 34, "The economy", "Tax cuts were announced in a bid to stimulate the sluggish economy.", "Durgun ekonomi"),
    # Unit 35: Social issues
    ("antisocial behaviour", "adj-noun", 35, "Social issues", "The neighbourhood watch aims to crack down on antisocial behaviour.", "Toplum karşıtı davranışlar"),
    ("dysfunctional family", "adj-noun", 35, "Social issues", "The novel portrays the complex struggles of a dysfunctional family.", "İşlevsiz / sorunlu aile"),
    # Unit 36: Science & Tech
    ("harness technology", "verb-noun", 36, "Science and technology", "Modern hospitals harness technology to diagnose rare diseases early.", "Teknolojiden yararlanmak"),
    ("cutting-edge technology", "adj-noun", 36, "Science and technology", "The laboratory is equipped with cutting-edge technology.", "En son teknoloji"),
    ("push back the frontiers", "phrase", 36, "Science and technology", "Astrophysicists are pushing back the frontiers of our knowledge.", "Bilgi sınırlarını genişletmek")
]

for chunk, c_type, u_num, u_title, sentence, meaning in ADV_COLLOCS:
    cloze = sentence
    pat = re.compile(re.escape(chunk), re.IGNORECASE)
    if pat.search(cloze):
        cloze = pat.sub('___', cloze)
    else:
        cloze = f"It is essential to ___ in this scenario."

    col_id = f"col_adv_u{u_num:02d}_{len(curriculum)+1:03d}"
    add_collocation({
        "id": col_id,
        "chunk": chunk,
        "type": c_type,
        "cefrLevel": "C1" if u_num < 30 else "C2",
        "category": "academic" if u_num in [6, 7, 36] else ("business" if u_num in [8, 9, 33, 34] else "everyday"),
        "meaning": f"[Advanced Unit {u_num}: {u_title}] {meaning}",
        "collocates": [],
        "commonMistakes": [],
        "examples": [
            {
                "sentence": sentence,
                "clozeSentence": cloze,
                "missingWord": chunk
            }
        ],
        "unitNumber": u_num,
        "unitTitle": u_title,
        "level": "Advanced"
    })

print(f"TOTAL FINAL CURRICULUM ITEMS: {len(curriculum)}")

# Save to seedData.ts
ts_code = f"""import {{ Collocation }} from '../types';

/**
 * Curated High-Frequency Collocation Curriculum
 * Source: Cambridge English Collocations in Use (Intermediate & Advanced)
 * Direct unit-by-unit mapping with authentic sentences, cloze gaps, and CEFR levels.
 */
export const SEED_COLLOCATIONS: Collocation[] = {json.dumps(curriculum, ensure_ascii=False, indent=2)};
"""

with open('src/data/seedData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_code)

print("Saved successfully to src/data/seedData.ts!")
