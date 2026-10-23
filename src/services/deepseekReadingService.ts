import { Collocation, GeneratedReadingPassage, ReadingGenre, ComprehensionQuestion, PassageVocabularyItem } from '../types';
import { useAppStore } from '../store/useAppStore';

/**
 * Resolves the DeepSeek API key from user settings, environment variables, or window fallback.
 */
export function getActiveApiKey(): string {
  const storeKey = useAppStore.getState().settings.deepseekApiKey?.trim();
  if (storeKey) return storeKey;

  if (typeof __DEEPSEEK_API_KEY__ !== 'undefined' && __DEEPSEEK_API_KEY__) {
    return __DEEPSEEK_API_KEY__.trim();
  }

  const envKey = (
    (import.meta as any).env?.VITE_DEEPSEEK_API_KEY ||
    (import.meta as any).env?.deep_Seek_api_key ||
    (import.meta as any).env?.DEEP_SEEK_API_KEY ||
    (import.meta as any).env?.DEEPSEEK_API_KEY
  )?.trim();
  if (envKey) return envKey;

  return '';
}

/**
 * Tests connection to DeepSeek API with a minimal completion request.
 */
export async function testDeepSeekConnection(keyToTest?: string): Promise<{
  success: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const key = (keyToTest || getActiveApiKey()).trim();
  if (!key) {
    return { success: false, error: 'No API key provided. Please enter a DeepSeek API key.' };
  }

  const start = performance.now();
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a test ping bot. Respond strictly with: {"status":"pong"}' },
          { role: 'user', content: 'ping' },
        ],
        max_tokens: 30,
        temperature: 0.1,
      }),
    });

    const elapsed = Math.round(performance.now() - start);

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) errorMsg = parsed.error.message;
      } catch {
        // use raw error text
      }
      return { success: false, latencyMs: elapsed, error: errorMsg };
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return { success: true, latencyMs: elapsed };
    }

    return { success: false, latencyMs: elapsed, error: 'Unexpected response format from DeepSeek API' };
  } catch (err: unknown) {
    const elapsed = Math.round(performance.now() - start);
    return {
      success: false,
      latencyMs: elapsed,
      error: err instanceof Error ? err.message : 'Network error or connection refused',
    };
  }
}

export interface GeneratePassageOptions {
  unitNumber: number;
  unitTitle: string;
  level: 'Intermediate' | 'Advanced';
  collocations: Collocation[];
  genre?: ReadingGenre;
  numCollocations?: number;
  apiKeyOverride?: string;
}

const GENRE_PROMPTS: Record<ReadingGenre, string> = {
  story: 'an engaging, character-driven short narrative or story with natural dialogue and rich situational imagery',
  workplace: 'a realistic workplace/business case study or professional office scenario involving teamwork, decision-making, and modern workplace challenges',
  academic: 'a well-reasoned, informative academic/scientific essay or analysis examining contemporary trends or research',
  dialogue: 'a dynamic, lively conversation between two articulate native speakers discussing personal, cultural, or career matters',
  news: 'an authentic journalistic feature or magazine article with compelling headlines and journalistic narrative style',
};

/**
 * Clean and parse JSON response from LLM output (handles ```json fences)
 */
function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

/**
 * Generates an authentic reading passage using DeepSeek Chat API.
 * Falls back to high-fidelity contextual generator if offline or API key is absent.
 */
export async function generateReadingPassage(
  options: GeneratePassageOptions
): Promise<GeneratedReadingPassage> {
  const {
    unitNumber,
    unitTitle,
    level,
    collocations,
    genre = 'story',
    numCollocations = 7,
    apiKeyOverride,
  } = options;

  const apiKey = (apiKeyOverride || getActiveApiKey()).trim();

  // Shuffle and pick target collocations from the unit
  const shuffled = [...collocations].sort(() => 0.5 - Math.random());
  const selectedCols = shuffled.slice(0, Math.min(numCollocations, shuffled.length));

  if (selectedCols.length === 0) {
    throw new Error('No collocations available in this unit.');
  }

  // If no API key is configured, fallback to offline generator
  if (!apiKey) {
    return generateOfflinePassage(unitNumber, unitTitle, level, selectedCols, genre);
  }

  const collocationsPayload = selectedCols.map((c) => ({
    chunk: c.chunk,
    type: c.type,
    meaning: c.meaning,
    meaningTr: c.meaningTr || '',
    cefr: c.cefrLevel,
  }));

  const genreDescription = GENRE_PROMPTS[genre];
  const targetCefr = level === 'Advanced' ? 'C1/C2 (Advanced)' : 'B1/B2 (Upper Intermediate)';

  const systemPrompt = `You are a world-class Cambridge University Press lexicographer, author of English Collocations in Use, and master ELT curriculum designer.
Your task is to write an authentic, high-quality English reading passage specifically crafted for language learners studying collocations.

CRITICAL REQUIREMENTS:
1. Genre & Style: Write ${genreDescription}.
2. Target Level: ${targetCefr}. Ensure vocabulary and sentence structures naturally align with this CEFR level.
3. Natural Collocation Integration: Seamlessly integrate the specified target collocations into the narrative. They must sound completely natural, contextual, and unforced (NOT like a grammar exercise list).
4. Length: 2 to 4 coherent paragraphs (total 180 to 280 words).
5. Output Format: You MUST reply with STRICT, VALID JSON ONLY. Do NOT wrap in markdown code blocks if possible. Output pure JSON with the exact keys described.

JSON Schema:
{
  "title": "A captivating, evocative title for the passage",
  "paragraphs": [
    "First paragraph text...",
    "Second paragraph text...",
    "Third paragraph text..."
  ],
  "targetCollocations": [
    "exact chunk 1",
    "exact chunk 2"
  ],
  "turkishSummary": "2-3 akıcı Türkçe cümle ile metnin özeti ve ana fikri.",
  "vocabularyList": [
    {
      "chunk": "exact chunk",
      "meaning": "Clear English explanation in context",
      "meaningTr": "Doğal Türkçe karşılığı",
      "contextSentence": "The exact sentence from the text containing this collocation."
    }
  ],
  "comprehensionQuestions": [
    {
      "id": "q1",
      "question": "Clear multiple choice reading comprehension question testing narrative or collocation nuance?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0, // integer index (0, 1, 2, or 3)
      "explanation": "Detailed explanation of why this answer is correct according to the passage."
    },
    {
      "id": "q2",
      "question": "Question 2...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "explanation": "..."
    },
    {
      "id": "q3",
      "question": "Question 3 (focusing on how one of the key collocations is used in context)...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "..."
    }
  ]
}`;

  const userPrompt = `Unit: Unit ${unitNumber} - "${unitTitle}" (${level} Level)
Selected Target Collocations to incorporate:
${JSON.stringify(collocationsPayload, null, 2)}

Create an authentic, memorable ${genre} incorporating these collocations naturally. Return strict JSON.`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.65,
        max_tokens: 3500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      let errorMsg = `DeepSeek API error (${response.status}): ${response.statusText}`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error?.message) errorMsg = parsed.error.message;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('No content returned by DeepSeek API.');
    }

    const parsed = cleanAndParseJSON(rawContent);

    // Validate and build final structure
    const passage: GeneratedReadingPassage = {
      id: `passage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      unitNumber,
      unitTitle,
      level,
      title: parsed.title || `Reading Passage: ${unitTitle}`,
      genre,
      difficulty: level,
      targetCollocations: Array.isArray(parsed.targetCollocations)
        ? parsed.targetCollocations
        : selectedCols.map((c) => c.chunk),
      paragraphs: Array.isArray(parsed.paragraphs) ? parsed.paragraphs : [rawContent],
      turkishSummary: parsed.turkishSummary || '',
      vocabularyList: Array.isArray(parsed.vocabularyList)
        ? parsed.vocabularyList
        : selectedCols.map((c) => ({
            chunk: c.chunk,
            type: c.type,
            meaning: c.meaning,
            meaningTr: c.meaningTr || '',
            contextSentence: c.examples?.[0]?.sentence || '',
          })),
      comprehensionQuestions: Array.isArray(parsed.comprehensionQuestions)
        ? parsed.comprehensionQuestions.map((q: any, idx: number) => ({
            id: q.id || `q_${idx + 1}`,
            question: q.question || 'What is the main topic of the passage?',
            options: Array.isArray(q.options) && q.options.length === 4
              ? q.options
              : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
              ? q.correctAnswer
              : 0,
            explanation: q.explanation || 'Refer back to the passage for context.',
          }))
        : generateFallbackQuestions(selectedCols),
      createdAt: Date.now(),
    };

    return passage;
  } catch (err: unknown) {
    console.warn('DeepSeek generation failed, falling back to curated passage:', err);
    // If it was a network error or key error, provide curated offline passage but also inform user if needed
    return generateOfflinePassage(unitNumber, unitTitle, level, selectedCols, genre);
  }
}

/**
 * High-quality fallback offline passage generator in case of network disconnect or missing API key
 */
function generateOfflinePassage(
  unitNumber: number,
  unitTitle: string,
  level: 'Intermediate' | 'Advanced',
  selectedCols: Collocation[],
  genre: ReadingGenre
): GeneratedReadingPassage {
  const chunks = selectedCols.map((c) => c.chunk);
  const title = `A Closer Look: ${unitTitle}`;

  // Build a coherent narrative weave from collocation examples and definitions
  const p1Sentences = selectedCols.slice(0, 3).map((c) => {
    return c.examples?.[0]?.sentence || `It is essential to understand how to ${c.chunk} in everyday situations.`;
  });

  const p2Sentences = selectedCols.slice(3, 6).map((c) => {
    return c.examples?.[1]?.sentence || c.examples?.[0]?.sentence || `Many learners try to ${c.chunk} when writing essays.`;
  });

  const remainingSentences = selectedCols.slice(6).map((c) => {
    return c.examples?.[0]?.sentence || `Finally, remember to observe how native speakers ${c.chunk}.`;
  });

  const paragraphs: string[] = [
    `In our study of ${unitTitle.toLowerCase()}, certain combinations of words form natural partnerships that immediately signal linguistic fluency. ${p1Sentences.join(' ')}`,
    `When observing modern communication patterns, these phrases appear across diverse professional and personal contexts. ${p2Sentences.join(' ')} Recognizing these patterns allows learners to express complex thoughts with precision.`,
  ];

  if (remainingSentences.length > 0) {
    paragraphs.push(
      `Mastering these natural collocations transforms both writing and spoken expression. ${remainingSentences.join(' ')} With consistent spaced review, these collocations become second nature.`
    );
  }

  const vocabList: PassageVocabularyItem[] = selectedCols.map((c) => ({
    chunk: c.chunk,
    type: c.type,
    meaning: c.meaning,
    meaningTr: c.meaningTr || 'Türkçe anlam',
    contextSentence: c.examples?.[0]?.sentence || '',
  }));

  const questions: ComprehensionQuestion[] = generateFallbackQuestions(selectedCols);

  return {
    id: `passage_offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    unitNumber,
    unitTitle,
    level,
    title,
    genre,
    difficulty: level,
    targetCollocations: chunks,
    paragraphs,
    turkishSummary: `Bu okuma metni, ${unitTitle} ünitesindeki temel kollokasyonları ("${chunks.slice(0, 3).join('", "')}") bağlam içinde sunarak doğal dil kullanımını pekiştirmeyi amaçlamaktadır.`,
    vocabularyList: vocabList,
    comprehensionQuestions: questions,
    createdAt: Date.now(),
  };
}

function generateFallbackQuestions(cols: Collocation[]): ComprehensionQuestion[] {
  const col1 = cols[0];
  const col2 = cols[1] || cols[0];
  const col3 = cols[2] || cols[0];

  return [
    {
      id: 'q1',
      question: `What is the primary role of the phrase "${col1?.chunk || 'collocation'}" in the context of the text?`,
      options: [
        `It expresses ${col1?.meaning || 'a core action'} in a natural and authentic manner.`,
        'It serves as a grammatical error that learners should avoid.',
        'It indicates an informal slang term rarely found in standard English.',
        'It contradicts the central message of the passage.',
      ],
      correctAnswer: 0,
      explanation: `"${col1?.chunk}" accurately communicates "${col1?.meaning}", providing natural idiomatic flow to the sentence.`,
    },
    {
      id: 'q2',
      question: `Based on the passage, which collocation best conveys "${col2?.meaning || 'the intended meaning'}"?`,
      options: [
        'An arbitrary translation from another language',
        `"${col2?.chunk}"`,
        'A single isolated noun without a partnering verb',
        'None of the above',
      ],
      correctAnswer: 1,
      explanation: `The passage demonstrates that "${col2?.chunk}" is the established English collocation for this concept.`,
    },
    {
      id: 'q3',
      question: `What can be inferred about mastering collocations like "${col3?.chunk || 'these phrases'}"?`,
      options: [
        'They should only be memorized individually without example sentences.',
        'They are solely used in archaic English literature.',
        'Using them appropriately enhances both precision and natural fluency.',
        'They are completely interchangeable with any other synonyms.',
      ],
      correctAnswer: 2,
      explanation: 'Authentic collocations reflect native speaker patterns and significantly enhance naturalness.',
    },
  ];
}
