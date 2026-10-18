import React from 'react';

/**
 * Normalizes Turkish & English characters for flexible search
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Renders a sentence with the target collocation highlighted cleanly.
 * Handles irregular forms (e.g. make -> made / making, cast -> casts / casting).
 */
export function renderSentenceWithHighlight(
  sentence: string,
  chunk: string,
  highlightClass = 'text-cyan-300 font-extrabold underline decoration-cyan-500/50 decoration-2'
): React.ReactNode {
  if (!sentence || !chunk) return sentence;

  // Build a smart regex for the chunk:
  // Split chunk into words to allow mild inflection on verbs (e.g., make -> made/makes/making)
  const words = chunk.trim().split(/\s+/);
  
  if (words.length === 1) {
    const reg = new RegExp(`(${words[0]})`, 'gi');
    const parts = sentence.split(reg);
    return parts.map((part, i) =>
      part.toLowerCase() === words[0].toLowerCase() ? (
        <span key={i} className={highlightClass}>
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  // Exact or near-exact match first
  const escapedChunk = chunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exactReg = new RegExp(`(${escapedChunk})`, 'gi');

  if (exactReg.test(sentence)) {
    const parts = sentence.split(exactReg);
    return parts.map((part, i) =>
      part.toLowerCase() === chunk.toLowerCase() ? (
        <span key={i} className={highlightClass}>
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  // Fallback: match inflected verb forms in the sentence (e.g., "made an effort" for "make an effort")
  const restWords = words.slice(1).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
  const inflectedReg = new RegExp(`(\\b\\w+\\s+${restWords})`, 'gi');

  if (inflectedReg.test(sentence)) {
    const parts = sentence.split(inflectedReg);
    return parts.map((part, i) =>
      inflectedReg.test(part) ? (
        <span key={i} className={highlightClass}>
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  return sentence;
}
