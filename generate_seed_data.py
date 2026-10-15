import json

# Comprehensive curriculum directly from English Collocations in Use Intermediate
book_collocations = [
  # --- UNIT 6: Intensifying Adverbs ---
  {
    "id": "col_u06_01",
    "chunk": "highly unlikely",
    "type": "adv-adj",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 6: Intensifying adverbs] Almost certainly not going to occur; very improbable.",
    "collocates": ["highly unusual", "highly successful", "highly competitive", "highly recommended"],
    "commonMistakes": ["strongly unlikely", "utterly unlikely", "very much unlikely"],
    "examples": [
      {
        "sentence": "It is highly unlikely that I will finish my research report on time.",
        "clozeSentence": "It is ___ that I will finish my research report on time.",
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
    "meaning": "[Unit 6: Intensifying adverbs] Completely absurd, nonsensical, or deserving of ridicule.",
    "collocates": ["utterly absurd", "utterly devastated", "utterly impossible", "utterly miserable"],
    "commonMistakes": ["highly ridiculous", "bitterly ridiculous", "strongly ridiculous"],
    "examples": [
      {
        "sentence": "The politician's excuse was utterly ridiculous and convinced nobody.",
        "clozeSentence": "The politician's excuse was ___ and convinced nobody.",
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
    "meaning": "[Unit 6: Intensifying adverbs] Deeply and painfully saddened when something fails to meet expectations.",
    "collocates": ["bitterly cold", "bitterly regret", "bitterly resent", "bitterly complain"],
    "commonMistakes": ["highly disappointed", "sourly disappointed", "deeply disappointed (bitterly is the key collocation)"],
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
    "meaning": "[Unit 6: Intensifying adverbs] To endorse or advise with substantial certainty and conviction.",
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
    "meaning": "[Unit 6: Intensifying adverbs] Absurdly and unreasonably high in price.",
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
  {
    "id": "col_u06_06",
    "chunk": "deeply committed",
    "type": "adv-adj",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 6: Intensifying adverbs] Possessing unwavering, sincere dedication to a cause or group.",
    "collocates": ["deeply religious", "deeply hurt", "deeply divided", "deeply regret"],
    "commonMistakes": ["highly committed", "strongly committed (less idiomatic in SLA research)"],
    "examples": [
      {
        "sentence": "Professor McDellvit was always deeply committed to her students' academic progress.",
        "clozeSentence": "Professor McDellvit was always ___ to her students' academic progress.",
        "missingWord": "deeply committed"
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
    "meaning": "[Unit 7: Everyday verbs 1] To do something incorrectly or commit an unintentional error.",
    "collocates": ["make an effort", "make a decision", "make an excuse", "make progress"],
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
    "meaning": "[Unit 7: Everyday verbs 1] To cause physical, financial, or structural destruction.",
    "collocates": ["do serious damage", "do harm", "do your best", "do some work"],
    "commonMistakes": ["make damage", "create damage", "give damage to"],
    "examples": [
      {
        "sentence": "The gale force winds did considerable damage to the seaside pier.",
        "clozeSentence": "The gale force winds ___ to the seaside pier.",
        "missingWord": "did considerable damage"
      }
    ]
  },
  {
    "id": "col_u07_03",
    "chunk": "make an effort",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 7: Everyday verbs 1] To exert physical or mental energy to achieve something.",
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
    "meaning": "[Unit 7: Everyday verbs 1] To perform an act of kindness or helpful service for another person.",
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
    "meaning": "[Unit 7: Everyday verbs 1] To advance toward a goal or show development.",
    "collocates": ["make steady progress", "make rapid progress", "make good progress"],
    "commonMistakes": ["do progress", "take progress", "gain progresses"],
    "examples": [
      {
        "sentence": "Holly is making steady progress with all her schoolwork.",
        "clozeSentence": "Holly is ___ with all her schoolwork.",
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
    "meaning": "[Unit 8: Everyday verbs 2] To lose the hair on one's scalp over time.",
    "collocates": ["go grey", "go blind", "go deaf", "go mad"],
    "commonMistakes": ["get bald", "become bald", "turn bald"],
    "examples": [
      {
        "sentence": "My uncle started to go bald when he was only twenty-five years old.",
        "clozeSentence": "My uncle started to ___ when he was only twenty-five years old.",
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
    "meaning": "[Unit 8: Everyday verbs 2] (Of a species) to vanish completely from the planet.",
    "collocates": ["become famous", "become unpopular", "become ill"],
    "commonMistakes": ["go extinct (informal standard)", "turn extinct", "get extinct"],
    "examples": [
      {
        "sentence": "Without conservation measures, several tropical amphibian species will become extinct.",
        "clozeSentence": "Without conservation measures, several tropical amphibian species will ___.",
        "missingWord": "become extinct"
      }
    ]
  },
  {
    "id": "col_u08_03",
    "chunk": "fall ill",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 8: Everyday verbs 2] To suddenly become unwell or contract an illness.",
    "collocates": ["fall silent", "fall asleep", "be taken ill"],
    "commonMistakes": ["drop ill", "go ill", "become illness"],
    "examples": [
      {
        "sentence": "Several tourists fell ill after consuming water from the contaminated mountain spring.",
        "clozeSentence": "Several tourists ___ after consuming water from the contaminated mountain spring.",
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
    "meaning": "[Unit 9: Everyday verbs 3] To do something practical and decisive to resolve an issue.",
    "collocates": ["take emergency action", "take disciplinary action", "take steps"],
    "commonMistakes": ["make action", "do action", "bring action"],
    "examples": [
      {
        "sentence": "The council must take action immediately to resolve local traffic congestion.",
        "clozeSentence": "The council must ___ immediately to resolve local traffic congestion.",
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
    "meaning": "[Unit 9: Everyday verbs 3] To give a remark expressing admiration or praise.",
    "collocates": ["pay tribute to", "pay respects to", "return the compliment"],
    "commonMistakes": ["make a compliment", "say a compliment", "give a compliment (pay is standard British/academic)"],
    "examples": [
      {
        "sentence": "The CEO paid him a compliment on the clarity of his financial summary.",
        "clozeSentence": "The CEO ___ on the clarity of his financial summary.",
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
    "meaning": "[Unit 12: Metaphor] An animated argument in which people express strong or angry emotions.",
    "collocates": ["heated debate", "heated argument", "spark a debate"],
    "commonMistakes": ["hot discussion", "warm discussion", "fire discussion"],
    "examples": [
      {
        "sentence": "The proposed zoning changes prompted a heated discussion at town hall.",
        "clozeSentence": "The proposed zoning changes prompted a ___ at town hall.",
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
    "meaning": "[Unit 12: Metaphor] A radiant, pleasant smile that projects cheerfulness and warmth.",
    "collocates": ["sunny disposition", "icy glare", "ideas flow"],
    "commonMistakes": ["sun smile", "solar smile", "brightly smile"],
    "examples": [
      {
        "sentence": "She flashed a sunny smile that immediately put the nervous interviewees at ease.",
        "clozeSentence": "She flashed a ___ that immediately put the nervous interviewees at ease.",
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
    "meaning": "[Unit 13: Weather] A continuous, dense layer of fog that blankets a landscape.",
    "collocates": ["patches of fog", "dense fog", "driving rain", "severe gale"],
    "commonMistakes": ["sheet of fog", "cover of fog", "curtain of fog"],
    "examples": [
      {
        "sentence": "A thick blanket of fog delayed international departures at the airport.",
        "clozeSentence": "A thick ___ delayed international departures at the airport.",
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
    "meaning": "[Unit 13: Weather] (Of a river) to overflow its physical sides and flood surrounding land.",
    "collocates": ["river overflows", "heavy downpour", "torrential rain"],
    "commonMistakes": ["break its banks", "explode its shores", "spill its edges"],
    "examples": [
      {
        "sentence": "After three days of unrelenting rain, the Thames burst its banks in several low-lying villages.",
        "clozeSentence": "After three days of unrelenting rain, the Thames ___ in several low-lying villages.",
        "missingWord": "burst its banks"
      }
    ]
  },
  {
    "id": "col_u13_03",
    "chunk": "driving rain",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 13: Weather] Rain falling heavily and being blown hard by powerful winds.",
    "collocates": ["biting cold", "howling wind", "freezing cold"],
    "commonMistakes": ["pushing rain", "hard-driving rain", "strong rain (heavy/driving rain is correct)"],
    "examples": [
      {
        "sentence": "The hikers struggled to walk against the ferocious driving rain on the hillside.",
        "clozeSentence": "The hikers struggled to walk against the ferocious ___ on the hillside.",
        "missingWord": "driving rain"
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
    "meaning": "[Unit 14: Travel] Low-cost lodging such as hostels or budget bed-and-breakfasts.",
    "collocates": ["family-run hotel", "stopover", "aisle seat", "window seat"],
    "commonMistakes": ["economic living", "cheap shelter", "budget housing"],
    "examples": [
      {
        "sentence": "Students traveling around Europe usually reserve budget accommodation well in advance.",
        "clozeSentence": "Students traveling around Europe usually reserve ___ well in advance.",
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
    "meaning": "[Unit 15: Countryside] A scenic vista that is awe-inspiring and extraordinarily magnificent.",
    "collocates": ["surrounding countryside", "unspoilt countryside", "well worth seeing"],
    "commonMistakes": ["breathless view", "breathed view", "view taking breath"],
    "examples": [
      {
        "sentence": "The balcony of the cliffside villa provided a breathtaking view of the Mediterranean Sea.",
        "clozeSentence": "The balcony of the cliffside villa provided a ___ of the Mediterranean Sea.",
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
    "meaning": "[Unit 16: Towns and cities] An urban metropolis spread out disorderly over immense geographical areas.",
    "collocates": ["volume of traffic", "bumper-to-bumper traffic", "lined with shops"],
    "commonMistakes": ["spreading city", "creeping city", "stretched city"],
    "examples": [
      {
        "sentence": "Los Angeles is a sprawling city characterized by endless highways and distinct suburbs.",
        "clozeSentence": "Los Angeles is a ___ characterized by endless highways and distinct suburbs.",
        "missingWord": "sprawling city"
      }
    ]
  },

  # --- UNIT 17: Character and Behaviour ---
  {
    "id": "col_u17_01",
    "chunk": "lose your patience",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 17: Character and behaviour] To surrender self-control and become visibly annoyed or angry.",
    "collocates": ["have a vivid imagination", "snap decision", "painfully shy"],
    "commonMistakes": ["miss your patience", "drop your patience", "abandon patience"],
    "examples": [
      {
        "sentence": "The customer service agent finally lost her patience after being shouted at repeatedly.",
        "clozeSentence": "The customer service agent finally ___ after being shouted at repeatedly.",
        "missingWord": "lost her patience"
      }
    ]
  },

  # --- UNIT 18: Physical Appearance ---
  {
    "id": "col_u18_01",
    "chunk": "immaculately groomed",
    "type": "adv-adj",
    "cefrLevel": "C1",
    "category": "everyday",
    "meaning": "[Unit 18: People: physical appearance] Extremely clean, tidy, well-dressed, and groomed with perfection.",
    "collocates": ["slender waist", "scruffy appearance", "youthful appearance"],
    "commonMistakes": ["immaculate groomed", "cleanly groomed", "perfect groomed"],
    "examples": [
      {
        "sentence": "The diplomatic attache arrived looking immaculately groomed in a tailored three-piece suit.",
        "clozeSentence": "The diplomatic attache arrived looking ___ in a tailored three-piece suit.",
        "missingWord": "immaculately groomed"
      }
    ]
  },

  # --- UNIT 19: Families ---
  {
    "id": "col_u19_01",
    "chunk": "close-knit family",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 19: Families] A family in which members share strong emotional bonds, support, and closeness.",
    "collocates": ["distant cousin", "expecting a baby", "stable home"],
    "commonMistakes": ["tight family", "close-tied family", "closed family"],
    "examples": [
      {
        "sentence": "Growing up in a close-knit family provided her with great resilience in difficult times.",
        "clozeSentence": "Growing up in a ___ provided her with great resilience in difficult times.",
        "missingWord": "close-knit family"
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
    "meaning": "[Unit 20: Relationships] An individual with whom you share a slight familiarity, not a close companion.",
    "collocates": ["love at first sight", "accept someone's proposal", "strike up a friendship"],
    "commonMistakes": ["informal acquaintance", "random acquaintance", "superficial friend"],
    "examples": [
      {
        "sentence": "We were not intimate colleagues, merely casual acquaintances who exchanged pleasantries in the lobby.",
        "clozeSentence": "We were not intimate colleagues, merely ___ who exchanged pleasantries in the lobby.",
        "missingWord": "casual acquaintances"
      }
    ]
  },

  # --- UNIT 21: Houses and Rooms ---
  {
    "id": "col_u21_01",
    "chunk": "spacious living room",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 21: Houses, flats and rooms] A main lounge with plenty of space and room to move.",
    "collocates": ["move into a flat", "fully furnished", "short-let accommodation"],
    "commonMistakes": ["roomy living room", "wide saloon", "big space room"],
    "examples": [
      {
        "sentence": "The apartment features a spacious living room overlooking the botanical gardens.",
        "clozeSentence": "The apartment features a ___ overlooking the botanical gardens.",
        "missingWord": "spacious living room"
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
    "meaning": "[Unit 22: Eating and drinking] Healthy, nutrient-rich food that supports stamina and wellness.",
    "collocates": ["spoil your appetite", "junk food", "fresh produce", "ready meal"],
    "commonMistakes": ["nutritious food (food is noun, meal collocates with nourishing)", "feeding meal"],
    "examples": [
      {
        "sentence": "Athletes require regular nourishing meals to recover from exhaustive training cycles.",
        "clozeSentence": "Athletes require regular ___ to recover from exhaustive training cycles.",
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
    "meaning": "[Unit 22: Eating and drinking] To ruin your desire for a proper meal by eating snacks beforehand.",
    "collocates": ["have a hearty breakfast", "dying of hunger", "fussy eater"],
    "commonMistakes": ["ruin your hunger", "break your appetite", "damage your appetite"],
    "examples": [
      {
        "sentence": "Having that sugary donut at four o'clock will spoil your appetite for family dinner.",
        "clozeSentence": "Having that sugary donut at four o'clock will ___ for family dinner.",
        "missingWord": "spoil your appetite"
      }
    ]
  },

  # --- UNIT 23: Films and Books ---
  {
    "id": "col_u23_01",
    "chunk": "absorbed in a book",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "literature",
    "meaning": "[Unit 23: Films and books] So deeply interested in reading that you do not notice other things around you.",
    "collocates": ["film critic", "go on the stage", "compelling read"],
    "commonMistakes": ["drowned in a book", "immersed into a book (absorbed in is standard)", "lost inside book"],
    "examples": [
      {
        "sentence": "She was so absorbed in a book that she missed her subway station completely.",
        "clozeSentence": "She was so ___ that she missed her subway station completely.",
        "missingWord": "absorbed in a book"
      }
    ]
  },

  # --- UNIT 26: Health and Illness ---
  {
    "id": "col_u26_01",
    "chunk": "splitting headache",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 26: Health and illness] A severe, pulsating headache that is intensely painful.",
    "collocates": ["catch a cold", "vigorous exercise", "be taken ill"],
    "commonMistakes": ["breaking headache", "tearing headache", "splitting head"],
    "examples": [
      {
        "sentence": "I woke up with a splitting headache after staring at screens for ten hours straight.",
        "clozeSentence": "I woke up with a ___ after staring at screens for ten hours straight.",
        "missingWord": "splitting headache"
      }
    ]
  },

  # --- UNIT 27: Using the Internet ---
  {
    "id": "col_u27_01",
    "chunk": "refine your search",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 27: Using the Internet] To narrow down or improve search criteria to obtain more accurate results.",
    "collocates": ["open an attachment", "browse the web", "search query"],
    "commonMistakes": ["purify your search", "filter down research", "clean your search"],
    "examples": [
      {
        "sentence": "If your search engine yields too many hits, use quotation marks to refine your search.",
        "clozeSentence": "If your search engine yields too many hits, use quotation marks to ___.",
        "missingWord": "refine your search"
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
    "meaning": "[Unit 28: Study and learning] To complete and hand in an assignment within the prescribed timeline.",
    "collocates": ["miss a deadline", "extend a deadline", "tight deadline"],
    "commonMistakes": ["catch a deadline", "reach a deadline", "arrive at a deadline"],
    "examples": [
      {
        "sentence": "The graduate students burned midnight oil to meet the deadline for paper submissions.",
        "clozeSentence": "The graduate students burned midnight oil to ___ for paper submissions.",
        "missingWord": "meet the deadline"
      }
    ]
  },

  # --- UNIT 29: Presentations ---
  {
    "id": "col_u29_01",
    "chunk": "target audience",
    "type": "adj-noun",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 29: Presentations] The specific group of people at whom a presentation, talk, or product is aimed.",
    "collocates": ["prepare handouts", "public speaking", "key point"],
    "commonMistakes": ["goal audience", "destination audience", "aimed public"],
    "examples": [
      {
        "sentence": "When structuring your slide deck, consider the technical background of your target audience.",
        "clozeSentence": "When structuring your slide deck, consider the technical background of your ___.",
        "missingWord": "target audience"
      }
    ]
  },

  # --- UNIT 30: Work ---
  {
    "id": "col_u30_01",
    "chunk": "hand in your notice",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 30: Work] To formally inform your employer in writing that you intend to resign from your job.",
    "collocates": ["high-powered job", "heavy workload", "climb the career ladder"],
    "commonMistakes": ["give your resignation letter (common, but hand in your notice is the idiomatic British collocation)", "send your quit"],
    "examples": [
      {
        "sentence": "She decided to hand in her notice after receiving an attractive offer from a competitor.",
        "clozeSentence": "She decided to ___ after receiving an attractive offer from a competitor.",
        "missingWord": "hand in her notice"
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
    "meaning": "[Unit 31: Business] To make a newly manufactured item commercially available to consumers.",
    "collocates": ["rival company", "gain market share", "set up a business", "make a profit"],
    "commonMistakes": ["start a product", "fire a product", "bring out goods"],
    "examples": [
      {
        "sentence": "The tech venture will launch a product in the fourth quarter to capitalize on holiday shopping.",
        "clozeSentence": "The tech venture will ___ in the fourth quarter to capitalize on holiday shopping.",
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
    "meaning": "[Unit 31: Business] To capture an increased portion of industry sales from competitors.",
    "collocates": ["lose market share", "fierce competition", "rival company"],
    "commonMistakes": ["win market percentage", "earn market share", "get market sector"],
    "examples": [
      {
        "sentence": "Aggressive digital marketing enabled the startup to gain market share in its first year.",
        "clozeSentence": "Aggressive digital marketing enabled the startup to ___ in its first year.",
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
    "meaning": "[Unit 32: Academic writing 1] To dispute, question, or present contradictory facts against an established hypothesis.",
    "collocates": ["support a theory", "formulate a theory", "carry out research", "key factor"],
    "commonMistakes": ["fight a theory", "oppose to a theory", "contest with a theory"],
    "examples": [
      {
        "sentence": "New empirical findings challenge the theory that cosmic inflation was uniform throughout space.",
        "clozeSentence": "New empirical findings ___ that cosmic inflation was uniform throughout space.",
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
    "meaning": "[Unit 32: Academic writing 1] To systematically execute research to discover new knowledge.",
    "collocates": ["conduct research", "undertake research", "publish findings"],
    "commonMistakes": ["make research", "do research (informal)", "produce research"],
    "examples": [
      {
        "sentence": "The institute received private endowments to carry out research into renewable battery storage.",
        "clozeSentence": "The institute received private endowments to ___ into renewable battery storage.",
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
    "meaning": "[Unit 33: Academic writing 2] To present reasons and evidence persuasively so that listeners are persuaded.",
    "collocates": ["research suggests", "make reference to", "draw conclusions"],
    "commonMistakes": ["argue persuasive", "discuss convincingly", "reason convincingly"],
    "examples": [
      {
        "sentence": "The paper argues convincingly that educational inequality exacerbates socio-economic division.",
        "clozeSentence": "The paper ___ that educational inequality exacerbates socio-economic division.",
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
    "meaning": "[Unit 34: Laws and punishments] To interpret guidelines loosely in order to grant an exception.",
    "collocates": ["break the law", "obey the law", "uphold the law", "pass a law"],
    "commonMistakes": ["curve the rules", "break the regulations slightly", "fold the rules"],
    "examples": [
      {
        "sentence": "The admissions dean refused to bend the rules for applicants without standard transcripts.",
        "clozeSentence": "The admissions dean refused to ___ for applicants without standard transcripts.",
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
    "meaning": "[Unit 35: Crime] A repeat offender who demonstrates cynical disregard for ethical norms and the legal code.",
    "collocates": ["juvenile crime", "tackle crime", "combat crime", "commit an offence"],
    "commonMistakes": ["heavy criminal", "hard criminal", "tough criminal"],
    "examples": [
      {
        "sentence": "Rehabilitation programs face tremendous resistance when dealing with hardened criminals.",
        "clozeSentence": "Rehabilitation programs face tremendous resistance when dealing with ___.",
        "missingWord": "hardened criminals"
      }
    ]
  },

  # --- UNIT 36: News ---
  {
    "id": "col_u36_01",
    "chunk": "hit the headlines",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 36: News] To suddenly receive massive coverage and attention in newspapers and broadcast media.",
    "collocates": ["breaking news", "hold talks", "take hostage"],
    "commonMistakes": ["touch the headlines", "reach headlines", "strike headlines"],
    "examples": [
      {
        "sentence": "The corruption scandal hit the headlines across all major morning publications.",
        "clozeSentence": "The corruption scandal ___ across all major morning publications.",
        "missingWord": "hit the headlines"
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
    "meaning": "[Unit 37: Money] To dissipate wealth or financial reserves frivolously on non-essential luxuries.",
    "collocates": ["tight budget", "price soars", "throw money down the drain"],
    "commonMistakes": ["scatter money", "dissipate money", "waste money out"],
    "examples": [
      {
        "sentence": "The municipal authority was heavily criticized for squandering money on vanity projects.",
        "clozeSentence": "The municipal authority was heavily criticized for ___ on vanity projects.",
        "missingWord": "squandering money"
      }
    ]
  },

  # --- UNIT 38: War and Peace ---
  {
    "id": "col_u38_01",
    "chunk": "call a truce",
    "type": "verb-noun",
    "cefrLevel": "C1",
    "category": "academic",
    "meaning": "[Unit 38: War and peace] To agree to stop fighting or hostilities, temporarily or permanently.",
    "collocates": ["war breaks out", "restore order", "avert disaster"],
    "commonMistakes": ["shout a truce", "ask a ceasefire", "make a truce"],
    "examples": [
      {
        "sentence": "International envoys pressured both sides to call a truce and allow humanitarian aid through.",
        "clozeSentence": "International envoys pressured both sides to ___ and allow humanitarian aid through.",
        "missingWord": "call a truce"
      }
    ]
  },

  # --- UNIT 39: Global Problems ---
  {
    "id": "col_u39_01",
    "chunk": "eradicate poverty",
    "type": "verb-noun",
    "cefrLevel": "C1",
    "category": "academic",
    "meaning": "[Unit 39: Global problems] To completely wipe out or eliminate conditions of extreme economic deprivation.",
    "collocates": ["forced migration", "famine relief", "combat poverty"],
    "commonMistakes": ["delete poverty", "destroy poverty", "extinguish poverty"],
    "examples": [
      {
        "sentence": "Developing sustainable rural infrastructure is vital to eradicate poverty globally.",
        "clozeSentence": "Developing sustainable rural infrastructure is vital to ___ globally.",
        "missingWord": "eradicate poverty"
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
    "meaning": "[Unit 40: Time] Continuously from early morning daylight until twilight in the evening.",
    "collocates": ["ungodly hours", "save time", "in the nick of time"],
    "commonMistakes": ["from morning to dark", "from sunrise till sundown"],
    "examples": [
      {
        "sentence": "During the autumn wine harvest, laborers worked tirelessly from dawn till dusk.",
        "clozeSentence": "During the autumn wine harvest, laborers worked tirelessly ___.",
        "missingWord": "from dawn till dusk"
      }
    ]
  },

  # --- UNIT 41: Sound ---
  {
    "id": "col_u41_01",
    "chunk": "break the silence",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "literature",
    "meaning": "[Unit 41: Sound] To make a noise that interrupts a quiet period or situation.",
    "collocates": ["excessive noise", "almighty bang", "eerie silence"],
    "commonMistakes": ["tear the silence", "smash the silence", "interrupt silence"],
    "examples": [
      {
        "sentence": "A sharp gunshot suddenly broke the silence of the tranquil forest.",
        "clozeSentence": "A sharp gunshot suddenly ___ of the tranquil forest.",
        "missingWord": "broke the silence"
      }
    ]
  },

  # --- UNIT 42: Distance and Size ---
  {
    "id": "col_u42_01",
    "chunk": "within commuting distance",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 42: Distance and size] Close enough to a town or city that one can travel to work there every day.",
    "collocates": ["painfully thin", "vast expanse", "easy reach"],
    "commonMistakes": ["in traveling distance", "at commuting range", "within work distance"],
    "examples": [
      {
        "sentence": "They sought a rural cottage that was still within commuting distance of London.",
        "clozeSentence": "They sought a rural cottage that was still ___ of London.",
        "missingWord": "within commuting distance"
      }
    ]
  },

  # --- UNIT 47: Movement and Speed ---
  {
    "id": "col_u47_01",
    "chunk": "painfully slow",
    "type": "adv-adj",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 47: Movement and speed] Progressing so slowly that it causes annoyance, distress, or boredom.",
    "collocates": ["prompt payment", "lose your balance", "crawl along"],
    "commonMistakes": ["hurtfully slow", "pain slow", "sorrowfully slow"],
    "examples": [
      {
        "sentence": "Traffic on the ring road was painfully slow because of road construction.",
        "clozeSentence": "Traffic on the ring road was ___ because of road construction.",
        "missingWord": "painfully slow"
      }
    ]
  },

  # --- UNIT 48: Change ---
  {
    "id": "col_u48_01",
    "chunk": "make an adjustment",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 48: Change] To make a slight modification or alteration to something.",
    "collocates": ["break a habit", "change the subject", "dramatic shift"],
    "commonMistakes": ["do an adjustment", "give an adjustment", "have an adjustment"],
    "examples": [
      {
        "sentence": "The sound technician had to make an adjustment to the microphone volume.",
        "clozeSentence": "The sound technician had to ___ to the microphone volume.",
        "missingWord": "make an adjustment"
      }
    ]
  },

  # --- UNIT 51: Starting and Finishing ---
  {
    "id": "col_u51_01",
    "chunk": "bring something to an end",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 51: Starting and finishing] To conclude or terminate an event, conflict, or situation.",
    "collocates": ["abrupt end", "promising start", "draw to a close"],
    "commonMistakes": ["make an end to", "bring something to finish", "put an end"],
    "examples": [
      {
        "sentence": "The mediator hoped the signed accord would bring the protracted border dispute to an end.",
        "clozeSentence": "The mediator hoped the signed accord would ___ to an end.",
        "missingWord": "bring the protracted border dispute"
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
    "meaning": "[Unit 52: Success and failure] To be completely, miserably, and utterly unsuccessful.",
    "collocates": ["spectacular failure", "make a breakthrough", "achieve success"],
    "commonMistakes": ["fail completely (fail miserably is the textbook collocation)", "fail poorly", "fail badly"],
    "examples": [
      {
        "sentence": "Despite heavy marketing expenditure, the experimental movie failed miserably at the box office.",
        "clozeSentence": "Despite heavy marketing expenditure, the experimental movie ___ at the box office.",
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
    "meaning": "[Unit 52: Success and failure] To accomplish a major scientific or technological discovery.",
    "collocates": ["remarkable breakthrough", "scientific breakthrough", "enjoy success"],
    "commonMistakes": ["do a breakthrough", "get a breakthrough", "reach a breakthrough"],
    "examples": [
      {
        "sentence": "The virology lab has made a breakthrough in synthesizing a universal influenza vaccine.",
        "clozeSentence": "The virology lab has ___ in synthesizing a universal influenza vaccine.",
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
    "meaning": "[Unit 53: Cause and effect] Detrimental, harmful, or undesirable consequences produced by an action.",
    "collocates": ["cause alarm", "have a major impact", "chain reaction"],
    "commonMistakes": ["reverse effects", "adversary effects", "opposed effects"],
    "examples": [
      {
        "sentence": "Scientists are monitoring the adverse effects of microplastics on marine food chains.",
        "clozeSentence": "Scientists are monitoring the ___ of microplastics on marine food chains.",
        "missingWord": "adverse effects"
      }
    ]
  },

  # --- UNIT 54: Remembering and Sensing ---
  {
    "id": "col_u54_01",
    "chunk": "vaguely remember",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 54: Remembering and sensing] To recall something indistinctly or without sharp clarity.",
    "collocates": ["blot out a memory", "have a feeling", "painful memory"],
    "commonMistakes": ["foggy remember", "slightly remember", "cloudily recall"],
    "examples": [
      {
        "sentence": "I vaguely remember meeting him at a graduation banquet years ago.",
        "clozeSentence": "I ___ meeting him at a graduation banquet years ago.",
        "missingWord": "vaguely remember"
      }
    ]
  },

  # --- UNIT 55: Agreeing and Disagreeing ---
  {
    "id": "col_u55_01",
    "chunk": "settle a dispute",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "business",
    "meaning": "[Unit 55: Agreeing and disagreeing] To resolve or bring to a satisfactory compromise an argument or conflict.",
    "collocates": ["agree to differ", "heated argument", "reach agreement"],
    "commonMistakes": ["calm a dispute", "close an argument (settle is standard legal/business)", "fix a dispute"],
    "examples": [
      {
        "sentence": "Both companies agreed to hire an independent arbitrator to settle the dispute.",
        "clozeSentence": "Both companies agreed to hire an independent arbitrator to ___.",
        "missingWord": "settle the dispute"
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
    "meaning": "[Unit 56: Beliefs and opinions] To bias or unfairly influence someone's impartiality and decision making.",
    "collocates": ["firmly believe", "cast doubt on", "strong opinion"],
    "commonMistakes": ["paint someone's judgement", "shade someone's judgement", "tint someone's opinion"],
    "examples": [
      {
        "sentence": "Judges are trained not to let sensational media coverage colour their judgement.",
        "clozeSentence": "Judges are trained not to let sensational media coverage ___.",
        "missingWord": "colour their judgement"
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
    "meaning": "[Unit 57: Deciding and choosing] To hesitate or reconsider after having initially made a commitment.",
    "collocates": ["arrive at a decision", "tough choice", "weigh up options"],
    "commonMistakes": ["have double thoughts", "get second ideas", "make second thoughts"],
    "examples": [
      {
        "sentence": "After signing the contract, she began to have second thoughts about relocating across the country.",
        "clozeSentence": "After signing the contract, she began to ___ about relocating across the country.",
        "missingWord": "have second thoughts"
      }
    ]
  },

  # --- UNIT 58: Claiming and Denying ---
  {
    "id": "col_u58_01",
    "chunk": "make the point that",
    "type": "phrase",
    "cefrLevel": "B2",
    "category": "academic",
    "meaning": "[Unit 58: Claiming and denying] To present a significant observation, argument, or claim during discussion.",
    "collocates": ["contradictory evidence", "deny an accusation", "claim falsely"],
    "commonMistakes": ["do the point that", "give the point", "throw the point"],
    "examples": [
      {
        "sentence": "The lead author made the point that preventative healthcare drastically reduces hospital admissions.",
        "clozeSentence": "The lead author ___ that preventative healthcare drastically reduces hospital admissions.",
        "missingWord": "made the point"
      }
    ]
  },

  # --- UNIT 59: Liking and Disliking ---
  {
    "id": "col_u59_01",
    "chunk": "take offence",
    "type": "verb-noun",
    "cefrLevel": "B2",
    "category": "everyday",
    "meaning": "[Unit 59: Liking and disliking] To feel insulted, hurt, or annoyed by someone's words or behavior.",
    "collocates": ["have a liking", "state a preference", "deep affection"],
    "commonMistakes": ["make offence", "get offence", "receive offence"],
    "examples": [
      {
        "sentence": "Please don't take offence at his blunt remarks; he was simply being candid.",
        "clozeSentence": "Please don't ___ at his blunt remarks; he was simply being candid.",
        "missingWord": "take offence"
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
    "meaning": "[Unit 60: Praising and criticising] To express enthusiastic approval, praise, or esteem for someone.",
    "collocates": ["offer your congratulations", "receive critical acclaim", "sing someone's praises"],
    "commonMistakes": ["talk highly about", "speak proudly of (different meaning)", "tell high of"],
    "examples": [
      {
        "sentence": "Former colleagues always speak highly of her integrity and analytical competence.",
        "clozeSentence": "Former colleagues always ___ her integrity and analytical competence.",
        "missingWord": "speak highly of"
      }
    ]
  }
]

print(f"Total curated collocations from book: {len(book_collocations)}")

ts_code = """import { Collocation } from '../types';

/**
 * Curated High-Frequency Collocation Corpus
 * Source: English Collocations in Use Intermediate (Cambridge University Press)
 * Directly structured for practice alongside Units 6 to 60.
 */
export const SEED_COLLOCATIONS: Collocation[] = """ + json.dumps(book_collocations, indent=2, ensure_ascii=False) + """;
"""

with open("src/data/seedData.ts", "w", encoding="utf-8") as f:
    f.write(ts_code)

print("Generated src/data/seedData.ts successfully.")
