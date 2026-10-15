import re
import json

# Read current seedData
with open('src/data/seedData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract json array
json_match = re.search(r'export const SEED_COLLOCATIONS: Collocation\[\] = (\[[\s\S]*\]);', text)
if not json_match:
    print("Could not find SEED_COLLOCATIONS")
    exit(1)

raw_json = json_match.group(1)
items = json.loads(raw_json)
print(f"Loaded {len(items)} existing items.")

# Enrich existing items
unit_regex = re.compile(r'\[Unit\s+(\d+):\s*([^\]]+)\]')
for item in items:
    m = unit_regex.search(item.get('meaning', ''))
    if m:
        item['unitNumber'] = int(m.group(1))
        item['unitTitle'] = m.group(2).strip()
    elif not item.get('unitNumber'):
        # extract from id e.g. col_u06_01
        id_m = re.search(r'col_u(\d+)_', item['id'])
        if id_m:
            item['unitNumber'] = int(id_m.group(1))
            item['unitTitle'] = f"Unit {id_m.group(1)}"
        else:
            item['unitNumber'] = 1
            item['unitTitle'] = "General Collocations"
    item['level'] = 'Intermediate'

# Add rich collocations for key units:
# Unit 1: Introduction to Collocations
new_intermediate = [
    {
        "id": "col_u01_01",
        "chunk": "fast food",
        "type": "adj-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 1: What is a collocation?] Quick-service prepared food (NOT 'quick food').",
        "collocates": ["fast car", "fast lane", "fast asleep"],
        "commonMistakes": ["quick food"],
        "examples": [
            {
                "sentence": "Eating too much fast food is harmful to your health.",
                "clozeSentence": "Eating too much ___ is harmful to your health.",
                "missingWord": "fast food"
            }
        ],
        "unitNumber": 1,
        "unitTitle": "What is a collocation?",
        "level": "Intermediate"
    },
    {
        "id": "col_u01_02",
        "chunk": "quick glance",
        "type": "adj-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 1: What is a collocation?] A very brief look (NOT 'fast glance').",
        "collocates": ["quick meal", "quick shower", "quick fix"],
        "commonMistakes": ["fast glance"],
        "examples": [
            {
                "sentence": "She took a quick glance at the clock before leaving.",
                "clozeSentence": "She took a ___ at the clock before leaving.",
                "missingWord": "quick glance"
            }
        ],
        "unitNumber": 1,
        "unitTitle": "What is a collocation?",
        "level": "Intermediate"
    },
    {
        "id": "col_u01_03",
        "chunk": "strictly forbidden",
        "type": "adv-adj",
        "cefrLevel": "B2",
        "category": "academic",
        "meaning": "[Unit 1: What is a collocation?] Completely prohibited with no exceptions (NOT 'strongly forbidden').",
        "collocates": ["strictly confidential", "strictly limited"],
        "commonMistakes": ["strongly forbidden", "heavily forbidden"],
        "examples": [
            {
                "sentence": "Smoking is strictly forbidden inside all university buildings.",
                "clozeSentence": "Smoking is ___ inside all university buildings.",
                "missingWord": "strictly forbidden"
            }
        ],
        "unitNumber": 1,
        "unitTitle": "What is a collocation?",
        "level": "Intermediate"
    },
    # Unit 7 additions: Make & Do
    {
        "id": "col_u07_05",
        "chunk": "make a decision",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 7: Everyday verbs 1] Choose after considering options (NOT 'do a decision').",
        "collocates": ["make a choice", "make up one's mind"],
        "commonMistakes": ["do a decision", "take a decision (British, but make is most common)"],
        "examples": [
            {
                "sentence": "We need to make a decision about our summer holiday plans.",
                "clozeSentence": "We need to ___ about our summer holiday plans.",
                "missingWord": "make a decision"
            }
        ],
        "unitNumber": 7,
        "unitTitle": "Everyday verbs 1: Make and do",
        "level": "Intermediate"
    },
    {
        "id": "col_u07_06",
        "chunk": "make an effort",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 7: Everyday verbs 1] Try hard to accomplish something (NOT 'do an effort').",
        "collocates": ["make an attempt", "make progress"],
        "commonMistakes": ["do an effort", "give an effort"],
        "examples": [
            {
                "sentence": "You should make an effort to arrive ten minutes before the interview.",
                "clozeSentence": "You should ___ to arrive ten minutes before the interview.",
                "missingWord": "make an effort"
            }
        ],
        "unitNumber": 7,
        "unitTitle": "Everyday verbs 1: Make and do",
        "level": "Intermediate"
    },
    {
        "id": "col_u07_07",
        "chunk": "make a mistake",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 7: Everyday verbs 1] Do something incorrect or erroneous (NOT 'do a mistake').",
        "collocates": ["make an error", "make a slip"],
        "commonMistakes": ["do a mistake"],
        "examples": [
            {
                "sentence": "Don't worry if you make a mistake; that is how we learn.",
                "clozeSentence": "Don't worry if you ___ ; that is how we learn.",
                "missingWord": "make a mistake"
            }
        ],
        "unitNumber": 7,
        "unitTitle": "Everyday verbs 1: Make and do",
        "level": "Intermediate"
    },
    {
        "id": "col_u07_08",
        "chunk": "do research",
        "type": "verb-noun",
        "cefrLevel": "B2",
        "category": "academic",
        "meaning": "[Unit 7: Everyday verbs 1] Carry out academic or scientific study (NOT 'make research').",
        "collocates": ["do an experiment", "do a project", "do homework"],
        "commonMistakes": ["make research"],
        "examples": [
            {
                "sentence": "The scientists are doing research into the causes of Alzheimer's.",
                "clozeSentence": "The scientists are ___ into the causes of Alzheimer's.",
                "missingWord": "doing research"
            }
        ],
        "unitNumber": 7,
        "unitTitle": "Everyday verbs 1: Make and do",
        "level": "Intermediate"
    },
    {
        "id": "col_u07_09",
        "chunk": "do your best",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 7: Everyday verbs 1] Try as hard as possible (NOT 'make your best').",
        "collocates": ["do well", "do your utmost"],
        "commonMistakes": ["make your best"],
        "examples": [
            {
                "sentence": "All we can ask is that you do your best in the test.",
                "clozeSentence": "All we can ask is that you ___ in the test.",
                "missingWord": "do your best"
            }
        ],
        "unitNumber": 7,
        "unitTitle": "Everyday verbs 1: Make and do",
        "level": "Intermediate"
    },
    {
        "id": "col_u07_10",
        "chunk": "do someone a favour",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 7: Everyday verbs 1] Help someone out of kindness (NOT 'make a favour').",
        "collocates": ["ask a favour", "return a favour"],
        "commonMistakes": ["make someone a favour"],
        "examples": [
            {
                "sentence": "Could you do me a favour and hold the door for a second?",
                "clozeSentence": "Could you ___ and hold the door for a second?",
                "missingWord": "do me a favour"
            }
        ],
        "unitNumber": 7,
        "unitTitle": "Everyday verbs 1: Make and do",
        "level": "Intermediate"
    },
    # Unit 8: Everyday verbs 2: Have, Take, Give, Pay
    {
        "id": "col_u08_05",
        "chunk": "pay attention",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "academic",
        "meaning": "[Unit 8: Everyday verbs 2] Listen or watch carefully (NOT 'give attention' / 'make attention').",
        "collocates": ["pay a compliment", "pay your respects", "pay a visit"],
        "commonMistakes": ["make attention", "give attention"],
        "examples": [
            {
                "sentence": "Please pay attention to the flight safety instructions.",
                "clozeSentence": "Please ___ to the flight safety instructions.",
                "missingWord": "pay attention"
            }
        ],
        "unitNumber": 8,
        "unitTitle": "Everyday verbs 2: Have, take, give, pay",
        "level": "Intermediate"
    },
    {
        "id": "col_u08_06",
        "chunk": "take a risk",
        "type": "verb-noun",
        "cefrLevel": "B2",
        "category": "business",
        "meaning": "[Unit 8: Everyday verbs 2] Do something that might result in loss or danger (NOT 'make a risk').",
        "collocates": ["take a chance", "run a risk"],
        "commonMistakes": ["make a risk", "do a risk"],
        "examples": [
            {
                "sentence": "Entrepreneurs must be willing to take a risk when launching a startup.",
                "clozeSentence": "Entrepreneurs must be willing to ___ when launching a startup.",
                "missingWord": "take a risk"
            }
        ],
        "unitNumber": 8,
        "unitTitle": "Everyday verbs 2: Have, take, give, pay",
        "level": "Intermediate"
    },
    {
        "id": "col_u08_07",
        "chunk": "give someone a lift",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 8: Everyday verbs 2] Take someone in your car to where they need to go (NOT 'make a lift').",
        "collocates": ["give a hand", "give an explanation", "give a speech"],
        "commonMistakes": ["take someone a lift", "make a lift"],
        "examples": [
            {
                "sentence": "I can give you a lift to the train station if it is raining.",
                "clozeSentence": "I can ___ to the train station if it is raining.",
                "missingWord": "give you a lift"
            }
        ],
        "unitNumber": 8,
        "unitTitle": "Everyday verbs 2: Have, take, give, pay",
        "level": "Intermediate"
    },
    # Unit 9: Everyday verbs 3: Break, Catch, Keep, See
    {
        "id": "col_u09_05",
        "chunk": "keep a secret",
        "type": "verb-noun",
        "cefrLevel": "B1",
        "category": "everyday",
        "meaning": "[Unit 9: Everyday verbs 3] Not tell anyone confidential information (NOT 'hold a secret').",
        "collocates": ["keep a promise", "keep in touch", "keep a diary"],
        "commonMistakes": ["hold a secret", "save a secret"],
        "examples": [
            {
                "sentence": "You can trust Sarah; she knows how to keep a secret.",
                "clozeSentence": "You can trust Sarah; she knows how to ___ .",
                "missingWord": "keep a secret"
            }
        ],
        "unitNumber": 9,
        "unitTitle": "Everyday verbs 3: Break, catch, keep, see",
        "level": "Intermediate"
    },
    {
        "id": "col_u09_06",
        "chunk": "catch someone's eye",
        "type": "verb-noun",
        "cefrLevel": "B2",
        "category": "everyday",
        "meaning": "[Unit 9: Everyday verbs 3] Attract someone's visual attention.",
        "collocates": ["catch a cold", "catch a glimpse", "catch a bus"],
        "commonMistakes": ["take someone's eye", "trap someone's eye"],
        "examples": [
            {
                "sentence": "A sparkling vintage watch caught my eye in the shop window.",
                "clozeSentence": "A sparkling vintage watch ___ in the shop window.",
                "missingWord": "caught my eye"
            }
        ],
        "unitNumber": 9,
        "unitTitle": "Everyday verbs 3: Break, catch, keep, see",
        "level": "Intermediate"
    },
    {
        "id": "col_u09_07",
        "chunk": "see the point",
        "type": "verb-noun",
        "cefrLevel": "B2",
        "category": "everyday",
        "meaning": "[Unit 9: Everyday verbs 3] Understand the reason or importance of something.",
        "collocates": ["see reason", "see sense"],
        "commonMistakes": ["look the point", "watch the point"],
        "examples": [
            {
                "sentence": "I see the point of revising collocations; it makes English sound natural.",
                "clozeSentence": "I ___ of revising collocations; it makes English sound natural.",
                "missingWord": "see the point"
            }
        ],
        "unitNumber": 9,
        "unitTitle": "Everyday verbs 3: Break, catch, keep, see",
        "level": "Intermediate"
    }
]

# Advanced Collocations (C1-C2) directly from English Collocations in Use Advanced
advanced_collocations = [
    {
        "id": "col_adv_u01_01",
        "chunk": "blissfully unaware",
        "type": "adv-adj",
        "cefrLevel": "C1",
        "category": "everyday",
        "meaning": "[Advanced Unit 1: Thinking and learning] Happily ignorant of something bad or threatening.",
        "collocates": ["blissfully happy", "blissfully quiet"],
        "commonMistakes": ["happily unaware", "strongly unaware"],
        "examples": [
            {
                "sentence": "The children played on the beach, blissfully unaware of the approaching storm.",
                "clozeSentence": "The children played on the beach, ___ of the approaching storm.",
                "missingWord": "blissfully unaware"
            }
        ],
        "unitNumber": 1,
        "unitTitle": "Thinking and learning",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u01_02",
        "chunk": "patently obvious",
        "type": "adv-adj",
        "cefrLevel": "C1",
        "category": "academic",
        "meaning": "[Advanced Unit 1: Thinking and learning] Completely and clearly evident to anyone.",
        "collocates": ["abundantly clear", "painfully obvious"],
        "commonMistakes": ["strongly obvious", "utterly obvious"],
        "examples": [
            {
                "sentence": "It was patently obvious that the company was heading for bankruptcy.",
                "clozeSentence": "It was ___ that the company was heading for bankruptcy.",
                "missingWord": "patently obvious"
            }
        ],
        "unitNumber": 1,
        "unitTitle": "Thinking and learning",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u02_01",
        "chunk": "cast doubt on",
        "type": "verb-noun",
        "cefrLevel": "C1",
        "category": "academic",
        "meaning": "[Advanced Unit 2: Metaphor & Idiomatic] Cause people to question or feel uncertain about something.",
        "collocates": ["shed light on", "spark debate", "blaze a trail"],
        "commonMistakes": ["throw doubt on", "make doubt on"],
        "examples": [
            {
                "sentence": "The recent findings cast doubt on the accuracy of previous medical studies.",
                "clozeSentence": "The recent findings ___ the accuracy of previous medical studies.",
                "missingWord": "cast doubt on"
            }
        ],
        "unitNumber": 2,
        "unitTitle": "Metaphorical Collocations",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u02_02",
        "chunk": "shed light on",
        "type": "verb-noun",
        "cefrLevel": "C1",
        "category": "academic",
        "meaning": "[Advanced Unit 2: Metaphor & Idiomatic] Provide an explanation that helps people understand a difficult problem.",
        "collocates": ["cast light on", "throw light on"],
        "commonMistakes": ["pour light on", "give light to"],
        "examples": [
            {
                "sentence": "This newly discovered diary sheds light on Shakespeare's early years in London.",
                "clozeSentence": "This newly discovered diary ___ Shakespeare's early years in London.",
                "missingWord": "sheds light on"
            }
        ],
        "unitNumber": 2,
        "unitTitle": "Metaphorical Collocations",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u03_01",
        "chunk": "wreak havoc",
        "type": "verb-noun",
        "cefrLevel": "C2",
        "category": "academic",
        "meaning": "[Advanced Unit 3: Strong verbs & impact] Cause extensive damage, confusion, or destruction.",
        "collocates": ["wreak destruction", "cause devastation"],
        "commonMistakes": ["make havoc", "do havoc", "create havoc (acceptable but wreak is the advanced collocation)"],
        "examples": [
            {
                "sentence": "The sudden snowstorm wreaked havoc on the nation's transport network.",
                "clozeSentence": "The sudden snowstorm ___ on the nation's transport network.",
                "missingWord": "wreaked havoc"
            }
        ],
        "unitNumber": 3,
        "unitTitle": "Impact & Conflict",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u03_02",
        "chunk": "harbour suspicions",
        "type": "verb-noun",
        "cefrLevel": "C2",
        "category": "literature",
        "meaning": "[Advanced Unit 3: Feelings & Reactions] Hold secret feelings of distrust over a long period.",
        "collocates": ["harbour resentment", "harbour doubts"],
        "commonMistakes": ["hold suspicions", "keep doubts"],
        "examples": [
            {
                "sentence": "The detectives began to harbour suspicions regarding the accountant's financial records.",
                "clozeSentence": "The detectives began to ___ regarding the accountant's financial records.",
                "missingWord": "harbour suspicions"
            }
        ],
        "unitNumber": 3,
        "unitTitle": "Impact & Conflict",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u04_01",
        "chunk": "broach the subject",
        "type": "verb-noun",
        "cefrLevel": "C1",
        "category": "everyday",
        "meaning": "[Advanced Unit 4: Communication] Carefully introduce a sensitive or difficult topic for discussion.",
        "collocates": ["raise the issue", "touch upon the topic"],
        "commonMistakes": ["open the subject", "start the subject"],
        "examples": [
            {
                "sentence": "He was nervous to broach the subject of a salary increase with his manager.",
                "clozeSentence": "He was nervous to ___ of a salary increase with his manager.",
                "missingWord": "broach the subject"
            }
        ],
        "unitNumber": 4,
        "unitTitle": "Communication & Diplomacy",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u04_02",
        "chunk": "strike a balance",
        "type": "verb-noun",
        "cefrLevel": "C1",
        "category": "business",
        "meaning": "[Advanced Unit 4: Communication] Find a fair and workable middle ground between two opposing things.",
        "collocates": ["strike a chord", "maintain equilibrium"],
        "commonMistakes": ["make a balance", "hit a balance"],
        "examples": [
            {
                "sentence": "It is crucial to strike a balance between work commitments and personal life.",
                "clozeSentence": "It is crucial to ___ between work commitments and personal life.",
                "missingWord": "strike a balance"
            }
        ],
        "unitNumber": 4,
        "unitTitle": "Communication & Diplomacy",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u05_01",
        "chunk": "curb inflation",
        "type": "verb-noun",
        "cefrLevel": "C1",
        "category": "business",
        "meaning": "[Advanced Unit 5: Economics & Finance] Control or limit rising consumer prices.",
        "collocates": ["curb spending", "curb emissions"],
        "commonMistakes": ["stop inflation", "brake inflation"],
        "examples": [
            {
                "sentence": "The central bank raised interest rates in an aggressive bid to curb inflation.",
                "clozeSentence": "The central bank raised interest rates in an aggressive bid to ___ .",
                "missingWord": "curb inflation"
            }
        ],
        "unitNumber": 5,
        "unitTitle": "Economics and Finance",
        "level": "Advanced"
    },
    {
        "id": "col_adv_u05_02",
        "chunk": "plummeting profits",
        "type": "adj-noun",
        "cefrLevel": "C1",
        "category": "business",
        "meaning": "[Advanced Unit 5: Economics & Finance] Business earnings falling steeply and rapidly.",
        "collocates": ["soaring prices", "sluggish economy"],
        "commonMistakes": ["falling-down profits", "dropping earnings"],
        "examples": [
            {
                "sentence": "The retail chain was forced to close stores due to plummeting profits.",
                "clozeSentence": "The retail chain was forced to close stores due to ___ .",
                "missingWord": "plummeting profits"
            }
        ],
        "unitNumber": 5,
        "unitTitle": "Economics and Finance",
        "level": "Advanced"
    }
]

existing_ids = {x['id'] for x in items}
for n in new_intermediate:
    if n['id'] not in existing_ids:
        items.append(n)
        existing_ids.add(n['id'])

for a in advanced_collocations:
    if a['id'] not in existing_ids:
        items.append(a)
        existing_ids.add(a['id'])

print(f"Total curriculum collocations: {len(items)}")

# Output new seedData.ts
ts_content = f"""import {{ Collocation }} from '../types';

/**
 * Curated High-Frequency Collocation Curriculum
 * Source: Cambridge English Collocations in Use (Intermediate & Advanced)
 * Direct unit-by-unit mapping with CEFR levels, collocations, cloze tests, and common errors.
 */
export const SEED_COLLOCATIONS: Collocation[] = {json.dumps(items, ensure_ascii=False, indent=2)};
"""

with open('src/data/seedData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Updated src/data/seedData.ts successfully!")
