/**
 * Parses and extracts clean core wrong phrases and explanations from commonMistakes strings.
 * Formats supported:
 * 1. "make a mistake (explanation...)" -> core: "make a mistake", explanation: "explanation..."
 * 2. "'make a mistake' yanlıştır..." -> core: "make a mistake", explanation: "yanlıştır..."
 * 3. "Sıralama değiştirilerek 'pains and aches' denebilir..." -> core: "pains and aches"
 * 4. "make an offer kabul etmek..." -> core: "make an offer", explanation: "kabul etmek..."
 */

export function extractMistakeCore(raw: string, targetChunk?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // Pattern 1: Core followed by parenthesis: "core (explanation)"
  if (trimmed.includes('(')) {
    const beforeParen = trimmed.split('(')[0].trim();
    const clean = cleanQuotes(beforeParen);
    if (clean && !hasTurkishChars(clean)) {
      return clean;
    }
  }

  // Pattern 2: Quoted phrase anywhere in the text: 'wrong phrase' or "wrong phrase"
  const allQuotes = Array.from(trimmed.matchAll(/['"«“]([^'"»”]+)['"»”]/g)).map((m) => m[1].trim());
  if (allQuotes.length > 0) {
    // If multiple quoted parts (e.g. 'dull ache' yerine 'dull pain'), pick the one that is NOT the correct targetChunk
    if (targetChunk) {
      const wrongQuoted = allQuotes.find(
        (q) => q.toLowerCase() !== targetChunk.toLowerCase() && !hasTurkishChars(q) && q.split(/\s+/).length <= 5
      );
      if (wrongQuoted) return cleanQuotes(wrongQuoted);
    }
    // Otherwise pick the first non-Turkish quoted phrase
    const candidate = allQuotes.find((q) => !hasTurkishChars(q) && q.split(/\s+/).length <= 5);
    if (candidate) return cleanQuotes(candidate);
  }

  // Pattern 3: Separated by punctuation (semicolon, colon, dash)
  const punctSplit = trimmed.split(/[;:—]/)[0].trim();
  if (punctSplit && punctSplit.length < trimmed.length) {
    const punctClean = cleanQuotes(punctSplit);
    if (!hasTurkishChars(punctClean) && punctClean.split(/\s+/).length <= 4) {
      return punctClean;
    }
  }

  // Pattern 4: First English words before Turkish explanation words
  const words = trimmed.split(/\s+/);
  const stopIndex = words.findIndex((w) =>
    hasTurkishChars(w) ||
    /^(yanlış|yanlıştır|kabul|yerine|denmez|denir|şeklinde|tercih|gibi|etkisiyle|olmalıdır|gerekir|demek)$/i.test(w)
  );

  if (stopIndex > 0) {
    const extracted = words.slice(0, stopIndex).join(' ');
    const cleaned = cleanQuotes(extracted);
    if (!hasTurkishChars(cleaned)) {
      return cleaned;
    }
  }

  return cleanQuotes(trimmed);
}

export function extractMistakeExplanation(raw: string, targetChunk?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // If format is "core (explanation)"
  const parenMatch = trimmed.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }

  const core = extractMistakeCore(raw, targetChunk);
  if (core && trimmed.length > core.length) {
    // Return remainder after the core or quoted core
    const regex = new RegExp(`['"«“]?${escapeRegExp(core)}['"»”]?`, 'i');
    const cleaned = trimmed.replace(regex, '').replace(/^[\s,;:—\-]+|[\s,;:—\-]+$/g, '').trim();
    if (cleaned) return cleaned;
  }

  return '';
}

export function isCleanEnglishDistractor(phrase: string, targetChunk: string): boolean {
  if (!phrase) return false;
  const clean = cleanQuotes(phrase).trim();
  if (!clean) return false;
  if (clean.toLowerCase() === targetChunk.toLowerCase()) return false;
  if (hasTurkishChars(clean)) return false;
  if (/(yanlış|anlam|yerine|kullan|olmalı|değil|gerekir|demek)/i.test(clean)) return false;
  if (/[;:—?!]/.test(clean)) return false;

  const words = clean.split(/\s+/);
  return words.length >= 1 && words.length <= 5;
}

function cleanQuotes(str: string): string {
  return str.replace(/^['"«“]+|['"»”]+$/g, '').trim();
}

function hasTurkishChars(str: string): boolean {
  return /[ğüşıöçĞÜŞİÖÇ]/.test(str);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
