import json
import re

collocations = [
  # --- UNIT 6: Intensifying Adverbs ---
  {
    "id": "col_u06_01",
    "chunk": "highly unlikely",
    "type": "adv-adj",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 6: Intensifying adverbs] Almost certainly not going to happen; very improbable.",
    "collocates": ["highly unusual", "highly successful", "highly competitive", "highly profitable", "highly recommended"],
    "commonMistakes": ["strongly unlikely", "utterly unlikely", "very much unlikely"],
    "examples": [
      {
        "sentence": "It is highly unlikely that I will finish my research paper on time.",
        "clozeSentence": "It is ___ that I will finish my research paper on time.",
        "missingWord": "highly unlikely"
      }
    ]
  },
  {
    "id": "col_u06_02",
    "chunk": "utterly ridiculous",
    "type": "adv-adj",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 6: Intensifying adverbs] Completely absurd, unreasonable, or deserving of contempt.",
    "collocates": ["utterly absurd", "utterly devastated", "utterly impossible", "utterly miserable"],
    "commonMistakes": ["highly ridiculous", "bitterly ridiculous", "strongly ridiculous"],
    "examples": [
      {
        "sentence": "The politician's explanation was utterly ridiculous and nobody believed it.",
        "clozeSentence": "The politician's explanation was ___ and nobody believed it.",
        "missingWord": "utterly ridiculous"
      }
    ]
  },
  {
    "id": "col_u06_03",
    "chunk": "bitterly disappointed",
    "type": "adv-adj",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 6: Intensifying adverbs] Extremely disappointed, feeling deep sorrow or resentment.",
    "collocates": ["bitterly cold", "bitterly resent", "bitterly regret", "bitterly complain"],
    "commonMistakes": ["highly disappointed", "deeply disappointed (acceptable but bitterly is the classic collocation with feelings of disappointment)", "sourly disappointed"],
    "examples": [
      {
        "sentence": "I was bitterly disappointed when I failed the driving exam for the second time.",
        "clozeSentence": "I was ___ when I failed the driving exam for the second time.",
        "missingWord": "bitterly disappointed"
      }
    ]
  },
  {
    "id": "col_u06_04",
    "chunk": "strongly recommend",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 6: Intensifying adverbs] To advise or endorse with powerful conviction.",
    "collocates": ["strongly object", "strongly oppose", "strongly influence", "strongly believe"],
    "commonMistakes": ["highly object", "bitterly recommend", "deeply recommend"],
    "examples": [
      {
        "sentence": "I would strongly recommend that you learn a foreign language before traveling abroad.",
        "clozeSentence": "I would ___ that you learn a foreign language before traveling abroad.",
        "missingWord": "strongly recommend"
      }
    ]
  },
  {
    "id": "col_u06_05",
    "chunk": "ridiculously expensive",
    "type": "adv-adj",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 6: Intensifying adverbs] Incredibly and absurdly high-priced.",
    "collocates": ["ridiculously cheap", "ridiculously easy", "ridiculously low"],
    "commonMistakes": ["highly expensive", "bitterly expensive", "utterly cheap"],
    "examples": [
      {
        "sentence": "The restaurant in the city centre was ridiculously expensive, so we ate elsewhere.",
        "clozeSentence": "The restaurant in the city centre was ___, so we ate elsewhere.",
        "missingWord": "ridiculously expensive"
      }
    ]
  },

  # --- UNIT 7: Everyday verbs 1 (make and do) ---
  {
    "id": "col_u07_01",
    "chunk": "make a mistake",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 7: Everyday verbs 1] To do something incorrectly or commit an error.",
    "collocates": ["make an effort", "make a decision", "make an excuse", "make a choice"],
    "commonMistakes": ["do a mistake", "have a mistake", "produce a mistake"],
    "examples": [
      {
        "sentence": "They have made a mistake in our hotel bill and charged us double.",
        "clozeSentence": "They have ___ in our hotel bill and charged us double.",
        "missingWord": "made a mistake"
      }
    ]
  },
  {
    "id": "col_u07_02",
    "chunk": "do damage",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 7: Everyday verbs 1] To cause physical or metaphorical harm or destruction.",
    "collocates": ["do serious damage", "do harm", "do your best", "do some work"],
    "commonMistakes": ["make damage", "create damage", "give damage to"],
    "examples": [
      {
        "sentence": "The severe storm did significant damage to our roof and windows.",
        "clozeSentence": "The severe storm ___ to our roof and windows.",
        "missingWord": "did significant damage"
      }
    ]
  },
  {
    "id": "col_u07_03",
    "chunk": "make an effort",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 7: Everyday verbs 1] To try hard to accomplish something challenging.",
    "collocates": ["make a conscious effort", "make every effort", "make an attempt"],
    "commonMistakes": ["do an effort", "give an effort", "have an effort"],
    "examples": [
      {
        "sentence": "Michael is really making an effort with his mathematics coursework this term.",
        "clozeSentence": "Michael is really ___ with his mathematics coursework this term.",
        "missingWord": "making an effort"
      }
    ]
  },
  {
    "id": "col_u07_04",
    "chunk": "do someone a favour",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 7: Everyday verbs 1] To do a helpful or kind service for someone.",
    "collocates": ["do someone a good turn", "owe someone a favour", "ask a favour"],
    "commonMistakes": ["make someone a favour", "give someone a favour"],
    "examples": [
      {
        "sentence": "Could you do me a favour and pick up some groceries on your way back home?",
        "clozeSentence": "Could you ___ and pick up some groceries on your way back home?",
        "missingWord": "do me a favour"
      }
    ]
  },
  {
    "id": "col_u07_05",
    "chunk": "make progress",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 7: Everyday verbs 1] To develop, advance, or improve over time.",
    "collocates": ["make rapid progress", "make steady progress", "make good progress"],
    "commonMistakes": ["do progress", "take progress", "gain progresses"],
    "examples": [
      {
        "sentence": "Holly is making steady progress with all her university assignments.",
        "clozeSentence": "Holly is ___ with all her university assignments.",
        "missingWord": "making steady progress"
      }
    ]
  },

  # --- UNIT 8: Everyday verbs 2 (go, turn, become, fall) ---
  {
    "id": "col_u08_01",
    "chunk": "go bald",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 8: Everyday verbs 2] To lose one's hair over time.",
    "collocates": ["go blind", "go deaf", "go grey", "go mad"],
    "commonMistakes": ["get bald", "become bald (less idiomatic in conversational English)", "turn bald"],
    "examples": [
      {
        "sentence": "My father started to go bald in his early twenties.",
        "clozeSentence": "My father started to ___ in his early twenties.",
        "missingWord": "go bald"
      }
    ]
  },
  {
    "id": "col_u08_02",
    "chunk": "become extinct",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 8: Everyday verbs 2] (Of a species) to cease existing completely on Earth.",
    "collocates": ["become famous", "become ill", "become unpopular"],
    "commonMistakes": ["go extinct (informal, book specifies become extinct)", "get extinct", "turn extinct"],
    "examples": [
      {
        "sentence": "Dinosaurs became extinct millions of years before humans appeared.",
        "clozeSentence": "Dinosaurs ___ millions of years before humans appeared.",
        "missingWord": "became extinct"
      }
    ]
  },
  {
    "id": "col_u08_03",
    "chunk": "fall ill",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 8: Everyday verbs 2] To suddenly become unwell or contract a disease.",
    "collocates": ["fall asleep", "fall silent", "be taken ill"],
    "commonMistakes": ["drop ill", "go ill", "become illness"],
    "examples": [
      {
        "sentence": "Several conference delegates fell ill after eating the contaminated seafood.",
        "clozeSentence": "Several conference delegates ___ after eating the contaminated seafood.",
        "missingWord": "fell ill"
      }
    ]
  },

  # --- UNIT 9: Everyday verbs 3 (have, take, pay) ---
  {
    "id": "col_u09_01",
    "chunk": "take action",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 9: Everyday verbs 3] To do something decisive to solve a problem.",
    "collocates": ["take emergency action", "take disciplinary action", "take immediate steps"],
    "commonMistakes": ["make action", "do action", "bring action"],
    "examples": [
      {
        "sentence": "The government must take action to address youth unemployment immediately.",
        "clozeSentence": "The government must ___ to address youth unemployment immediately.",
        "missingWord": "take action"
      }
    ]
  },
  {
    "id": "col_u09_02",
    "chunk": "pay a compliment",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 9: Everyday verbs 3] To say something nice or flattering to someone.",
    "collocates": ["pay tribute to", "pay respects to", "return the compliment"],
    "commonMistakes": ["make a compliment", "give a compliment (common in US English, book teaches pay a compliment)", "say a compliment"],
    "examples": [
      {
        "sentence": "He was pleased when the director paid him a compliment on his presentation.",
        "clozeSentence": "He was pleased when the director ___ on his presentation.",
        "missingWord": "paid him a compliment"
      }
    ]
  },

  # --- UNIT 12: Metaphor ---
  {
    "id": "col_u12_01",
    "chunk": "heated discussion",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 12: Metaphor] An argument or conversation where people become very angry and passionate.",
    "collocates": ["heated debate", "heated argument", "spark a debate"],
    "commonMistakes": ["warm discussion", "hot discussion", "firing discussion"],
    "examples": [
      {
        "sentence": "The committee had a heated discussion regarding proposed budget cuts.",
        "clozeSentence": "The committee had a ___ regarding proposed budget cuts.",
        "missingWord": "heated discussion"
      }
    ]
  },
  {
    "id": "col_u12_02",
    "chunk": "sunny smile",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "literature",
    "meaning": "[Unit 12: Metaphor] A warm, radiant, and genuinely cheerful smile.",
    "collocates": ["sunny disposition", "radiant smile", "bright smile"],
    "commonMistakes": ["sun smile", "solar smile", "shiny smile"],
    "examples": [
      {
        "sentence": "The receptionist greeted every guest with a warm, sunny smile.",
        "clozeSentence": "The receptionist greeted every guest with a warm, ___.",
        "missingWord": "sunny smile"
      }
    ]
  },

  # --- UNIT 13: Weather ---
  {
    "id": "col_u13_01",
    "chunk": "blanket of fog",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 13: Weather] A thick, unbroken layer of fog covering an area.",
    "collocates": ["patches of fog", "dense fog", "driving rain", "severe gale"],
    "commonMistakes": ["sheet of fog", "cover of fog", "cloud of fog"],
    "examples": [
      {
        "sentence": "A thick blanket of fog covered the valley, making navigation treacherous.",
        "clozeSentence": "A thick ___ covered the valley, making navigation treacherous.",
        "missingWord": "blanket of fog"
      }
    ]
  },
  {
    "id": "col_u13_02",
    "chunk": "burst its banks",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 13: Weather] (Of a river) to overflow its edges and cause a flood.",
    "collocates": ["river overflows", "heavy downpour", "torrential rain"],
    "commonMistakes": ["break its banks", "explode its shores", "spill its edges"],
    "examples": [
      {
        "sentence": "Following days of relentless rain, the local river burst its banks and flooded houses.",
        "clozeSentence": "Following days of relentless rain, the local river ___ and flooded houses.",
        "missingWord": "burst its banks"
      }
    ]
  },

  # --- UNIT 14: Travel ---
  {
    "id": "col_u14_01",
    "chunk": "budget accommodation",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 14: Travel] Inexpensive places to stay, such as hostels or small guesthouses.",
    "collocates": ["family-run hotel", "stopover", "aisle seat", "window seat"],
    "commonMistakes": ["cheap housing (in travel context)", "budget living place", "economic room"],
    "examples": [
      {
        "sentence": "Backpackers often look for clean budget accommodation near the city centre.",
        "clozeSentence": "Backpackers often look for clean ___ near the city centre.",
        "missingWord": "budget accommodation"
      }
    ]
  },

  # --- UNIT 15: Countryside ---
  {
    "id": "col_u15_01",
    "chunk": "breathtaking view",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "literature",
    "meaning": "[Unit 15: Countryside] A scenic vista so stunning and spectacular it astonishes you.",
    "collocates": ["surrounding countryside", "unspoilt countryside", "well worth seeing"],
    "commonMistakes": ["breathless view", "breathed view", "taking breath view"],
    "examples": [
      {
        "sentence": "From the mountain peak, hikers enjoyed a breathtaking view of the alpine lake.",
        "clozeSentence": "From the mountain peak, hikers enjoyed a ___ of the alpine lake.",
        "missingWord": "breathtaking view"
      }
    ]
  },

  # --- UNIT 16: Towns and Cities ---
  {
    "id": "col_u16_01",
    "chunk": "sprawling city",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 16: Towns and cities] A city that has expanded over a very large area in an untidy way.",
    "collocates": ["volume of traffic", "bumper-to-bumper traffic", "lined with shops"],
    "commonMistakes": ["spreading city", "creeping city", "stretched city"],
    "examples": [
      {
        "sentence": "Tokyo is a sprawling city with interconnected transport systems spanning miles.",
        "clozeSentence": "Tokyo is a ___ with interconnected transport systems spanning miles.",
        "missingWord": "sprawling city"
      }
    ]
  },

  # --- UNIT 17: People: Character and Behaviour ---
  {
    "id": "col_u17_01",
    "chunk": "lose your patience",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 17: Character and behaviour] To become impatient or angry after waiting or enduring frustration.",
    "collocates": ["have a vivid imagination", "snap decision", "painfully shy"],
    "commonMistakes": ["miss your patience", "drop your patience", "leave your patience"],
    "examples": [
      {
        "sentence": "The teacher finally lost her patience when the students kept talking during the test.",
        "clozeSentence": "The teacher finally ___ when the students kept talking during the test.",
        "missingWord": "lost her patience"
      }
    ]
  },

  # --- UNIT 20: Relationships ---
  {
    "id": "col_u20_01",
    "chunk": "casual acquaintance",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 20: Relationships] Someone you know slightly, but who is not a close friend.",
    "collocates": ["love at first sight", "accept someone's proposal", "strike up a friendship"],
    "commonMistakes": ["informal acquaintance", "random acquaintance", "casual friend (different meaning)"],
    "examples": [
      {
        "sentence": "I wouldn't call him a close friend; he is merely a casual acquaintance from gym.",
        "clozeSentence": "I wouldn't call him a close friend; he is merely a ___ from gym.",
        "missingWord": "casual acquaintance"
      }
    ]
  },

  # --- UNIT 22: Eating and Drinking ---
  {
    "id": "col_u22_01",
    "chunk": "nourishing meal",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 22: Eating and drinking] Wholesome food that makes you healthy and strong.",
    "collocates": ["spoil your appetite", "junk food", "fresh produce", "ready meal"],
    "commonMistakes": ["nutritious food (collocation is nourishing meal)", "feeding meal"],
    "examples": [
      {
        "sentence": "It is difficult to persuade young kids to eat nourishing meals instead of snacks.",
        "clozeSentence": "It is difficult to persuade young kids to eat ___ instead of snacks.",
        "missingWord": "nourishing meals"
      }
    ]
  },
  {
    "id": "col_u22_02",
    "chunk": "spoil your appetite",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 22: Eating and drinking] To eat something before dinner so that you are no longer hungry.",
    "collocates": ["have a hearty breakfast", "dying of hunger", "fussy eater"],
    "commonMistakes": ["ruin your hunger", "break your appetite", "damage your appetite"],
    "examples": [
      {
        "sentence": "Don't eat chocolate now or you will spoil your appetite for dinner.",
        "clozeSentence": "Don't eat chocolate now or you will ___ for dinner.",
        "missingWord": "spoil your appetite"
      }
    ]
  },

  # --- UNIT 28: Study and Learning ---
  {
    "id": "col_u28_01",
    "chunk": "meet a deadline",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 28: Study and learning] To finish an assignment or project on or before the due date.",
    "collocates": ["miss a deadline", "extend a deadline", "tight deadline"],
    "commonMistakes": ["catch a deadline", "reach a deadline", "arrive at a deadline"],
    "examples": [
      {
        "sentence": "We had to work late into the evening to meet the deadline for the grant application.",
        "clozeSentence": "We had to work late into the evening to ___ for the grant application.",
        "missingWord": "meet the deadline"
      }
    ]
  },

  # --- UNIT 31: Business ---
  {
    "id": "col_u31_01",
    "chunk": "launch a product",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 31: Business] To introduce a new item onto the commercial market for sale.",
    "collocates": ["rival company", "gain market share", "set up a business", "make a profit"],
    "commonMistakes": ["release a product (common, but launch is standard business collocation)", "start a product", "fire a product"],
    "examples": [
      {
        "sentence": "The tech firm plans to launch a product aimed at freelance graphic designers.",
        "clozeSentence": "The tech firm plans to ___ aimed at freelance graphic designers.",
        "missingWord": "launch a product"
      }
    ]
  },
  {
    "id": "col_u31_02",
    "chunk": "gain market share",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 31: Business] To increase the percentage of total sales in an industry won by a company.",
    "collocates": ["lose market share", "fierce competition", "rival company"],
    "commonMistakes": ["win market percentage", "earn market share", "achieve market quota"],
    "examples": [
      {
        "sentence": "By lowering retail prices, the new airline managed to gain market share quickly.",
        "clozeSentence": "By lowering retail prices, the new airline managed to ___ quickly.",
        "missingWord": "gain market share"
      }
    ]
  },

  # --- UNIT 32: Academic Writing 1 ---
  {
    "id": "col_u32_01",
    "chunk": "challenge a theory",
    "type": "verb-noun",
    "cefrLevel": "C1",
    "category": "academic",
    "meaning": "[Unit 32: Academic writing 1] To dispute, question, or present arguments against an established hypothesis.",
    "collocates": ["support a theory", "formulate a theory", "carry out research", "key factor"],
    "commonMistakes": ["fight a theory", "oppose to a theory", "contest with a theory"],
    "examples": [
      {
        "sentence": "Recent neurological observations directly challenge the theory that brain growth ceases in childhood.",
        "clozeSentence": "Recent neurological observations directly ___ that brain growth ceases in childhood.",
        "missingWord": "challenge the theory"
      }
    ]
  },
  {
    "id": "col_u32_02",
    "chunk": "carry out research",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 32: Academic writing 1] To conduct a methodical scientific or academic investigation.",
    "collocates": ["conduct research", "undertake research", "publish findings"],
    "commonMistakes": ["make research", "do research (informal)", "produce research"],
    "examples": [
      {
        "sentence": "A team of chemists will carry out research into biodegradable polymers next year.",
        "clozeSentence": "A team of chemists will ___ into biodegradable polymers next year.",
        "missingWord": "carry out research"
      }
    ]
  },

  # --- UNIT 33: Academic Writing 2 ---
  {
    "id": "col_u33_01",
    "chunk": "argue convincingly",
    "type": "adv-adj",
    "cefrLevel": "C1",
    "category": "academic",
    "meaning": "[Unit 33: Academic writing 2] To present reasons and evidence persuasively so that others agree.",
    "collocates": ["research suggests", "make reference to", "draw conclusions"],
    "commonMistakes": ["argue persuasive", "discuss convincingly", "reason convincingly"],
    "examples": [
      {
        "sentence": "The sociologist argues convincingly that urban isolation reduces community wellbeing.",
        "clozeSentence": "The sociologist ___ that urban isolation reduces community wellbeing.",
        "missingWord": "argues convincingly"
      }
    ]
  },

  # --- UNIT 34: Laws and Punishments ---
  {
    "id": "col_u34_01",
    "chunk": "bend the rules",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 34: Laws and punishments] To interpret or modify rules in a lenient way to suit someone.",
    "collocates": ["break the law", "obey the law", "uphold the law", "pass a law"],
    "commonMistakes": ["curve the rules", "break the regulations slightly", "fold the rules"],
    "examples": [
      {
        "sentence": "The exam invigilator refused to bend the rules for students who arrived late.",
        "clozeSentence": "The exam invigilator refused to ___ for students who arrived late.",
        "missingWord": "bend the rules"
      }
    ]
  },

  # --- UNIT 35: Crime ---
  {
    "id": "col_u35_01",
    "chunk": "hardened criminal",
    "type": "adj-noun",
    "cefrLevel": "C1",
    "category": "academic",
    "meaning": "[Unit 35: Crime] Someone who has committed multiple crimes and shows no remorse.",
    "collocates": ["juvenile crime", "tackle crime", "combat crime", "commit an offence"],
    "commonMistakes": ["heavy criminal", "hard criminal", "tough criminal (different nuance)"],
    "examples": [
      {
        "sentence": "Security was tightened because the prison housed several hardened criminals.",
        "clozeSentence": "Security was tightened because the prison housed several ___.",
        "missingWord": "hardened criminals"
      }
    ]
  },

  # --- UNIT 37: Money ---
  {
    "id": "col_u37_01",
    "chunk": "squander money",
    "type": "verb-noun",
    "cefrLevel": "C1",
    "category": "business",
    "meaning": "[Unit 37: Money] To waste money foolishly or carelessly on unnecessary things.",
    "collocates": ["tight budget", "price soars", "throw money down the drain"],
    "commonMistakes": ["scatter money", "dissipate money", "waste money out"],
    "examples": [
      {
        "sentence": "The bankrupt heir managed to squander all his inheritance on luxury yachts.",
        "clozeSentence": "The bankrupt heir managed to ___ on luxury yachts.",
        "missingWord": "squander all his inheritance"
      }
    ]
  },

  # --- UNIT 40: Time ---
  {
    "id": "col_u40_01",
    "chunk": "from dawn till dusk",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "literature",
    "meaning": "[Unit 40: Time] From early sunrise in the morning until the sun goes down at night.",
    "collocates": ["ungodly hours", "save time", "in the nick of time"],
    "commonMistakes": ["from morning to dark", "from sunrise till sundown (poetic/less idiom)"],
    "examples": [
      {
        "sentence": "During harvest season, the local farmers toiled from dawn till dusk.",
        "clozeSentence": "During harvest season, the local farmers toiled ___.",
        "missingWord": "from dawn till dusk"
      }
    ]
  },

  # --- UNIT 52: Success and Failure ---
  {
    "id": "col_u52_01",
    "chunk": "fail miserably",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 52: Success and failure] To be totally, utterly, and embarrassingly unsuccessful.",
    "collocates": ["spectacular failure", "make a breakthrough", "achieve success"],
    "commonMistakes": ["fail completely (grammatically fine, but fail miserably is the book's core collocation)", "fail poorly", "fail badly"],
    "examples": [
      {
        "sentence": "Unfortunately, the peace talks failed miserably and hostilities resumed.",
        "clozeSentence": "Unfortunately, the peace talks ___ and hostilities resumed.",
        "missingWord": "failed miserably"
      }
    ]
  },
  {
    "id": "col_u52_02",
    "chunk": "make a breakthrough",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 52: Success and failure] To achieve an important development or discovery that helps solve a problem.",
    "collocates": ["remarkable breakthrough", "scientific breakthrough", "enjoy success"],
    "commonMistakes": ["do a breakthrough", "get a breakthrough", "reach a breakthrough"],
    "examples": [
      {
        "sentence": "Biochemists have made a breakthrough in developing targeted cancer immunotherapies.",
        "clozeSentence": "Biochemists have ___ in developing targeted cancer immunotherapies.",
        "missingWord": "made a breakthrough"
      }
    ]
  },

  # --- UNIT 53: Cause and Effect ---
  {
    "id": "col_u53_01",
    "chunk": "adverse effects",
    "type": "adj-noun",
    "cefrLevel": "C1",
    "category": "academic",
    "meaning": "[Unit 53: Cause and effect] Unwanted, harmful, or negative consequences or side-effects.",
    "collocates": ["cause alarm", "have a major impact", "chain reaction"],
    "commonMistakes": ["reverse effects", "adversary effects", "opposed effects"],
    "examples": [
      {
        "sentence": "Clinical trials revealed that the trial drug had no adverse effects on patients.",
        "clozeSentence": "Clinical trials revealed that the trial drug had no ___ on patients.",
        "missingWord": "adverse effects"
      }
    ]
  },

  # --- UNIT 56: Beliefs and Opinions ---
  {
    "id": "col_u56_01",
    "chunk": "colour someone's judgement",
    "type": "verb-noun",
    "cefrLevel": "C1",
    "category": "academic",
    "meaning": "[Unit 56: Beliefs and opinions] To influence someone's opinion or decision in a biased, negative way.",
    "collocates": ["firmly believe", "cast doubt on", "strong opinion"],
    "commonMistakes": ["paint someone's judgement", "shade someone's judgement", "tint someone's opinion"],
    "examples": [
      {
        "sentence": "Personal resentment shouldn't be allowed to colour your judgement during peer reviews.",
        "clozeSentence": "Personal resentment shouldn't be allowed to ___ during peer reviews.",
        "missingWord": "colour your judgement"
      }
    ]
  },

  # --- UNIT 57: Deciding and Choosing ---
  {
    "id": "col_u57_01",
    "chunk": "have second thoughts",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 57: Deciding and choosing] To start having doubts about a decision you previously made.",
    "collocates": ["arrive at a decision", "tough choice", "weigh up options"],
    "commonMistakes": ["have double thoughts", "get second ideas", "make second thoughts"],
    "examples": [
      {
        "sentence": "After signing the sales lease, she began to have second thoughts about moving abroad.",
        "clozeSentence": "After signing the sales lease, she began to ___ about moving abroad.",
        "missingWord": "have second thoughts"
      }
    ]
  },

  # --- UNIT 60: Praising and Criticising ---
  {
    "id": "col_u60_01",
    "chunk": "speak highly of",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 60: Praising and criticising] To praise or express admiration and respect for someone.",
    "collocates": ["offer your congratulations", "receive critical acclaim", "sing someone's praises"],
    "commonMistakes": ["talk highly about", "speak proudly of (different meaning)", "tell high of"],
    "examples": [
      {
        "sentence": "The managing partner always spoke highly of her dedication to the engineering team.",
        "clozeSentence": "The managing partner always ___ her dedication to the engineering team.",
        "missingWord": "spoke highly of"
      }
    ]
  }
]

print(f"Sample collocations count: {len(collocations)}")
