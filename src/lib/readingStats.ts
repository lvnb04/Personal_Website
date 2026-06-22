// src/lib/readingStats.ts
// Blog-tile stats: token count + Shannon entropy of word distribution.
// tokens ≈ prose-words × 1.3 (rough GPT-style ratio), shown as "N.Nk tokens".
// entropy = H = -Σ p(w) log₂ p(w) over the word-frequency distribution.
//   Bucketed into a human-readable intensity label:
//   < 4.0 → "low" | 4–5.5 → "medium" | 5.5–7.0 → "high" | >7.0 → "very high"
export interface ReadingStats {
  words: number;
  tokens: number;
  tokensK: string;    // e.g. "18.4k"
  entropy: string;    // e.g. "high"
}

/** Strip MDX/markdown markup, leaving only prose words. */
function extractProse(body: string): string {
  return (
    body
      // Remove frontmatter block
      .replace(/^---[\s\S]*?---/, "")
      // Remove JSX/HTML tags and their attributes (including multi-line)
      .replace(/<[^>]+>/g, " ")
      // Remove markdown images and links — keep link text only
      .replace(/!\[.*?\]\(.*?\)/g, " ")
      .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
      // Remove inline code and fenced code blocks
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      // Remove math blocks
      .replace(/\$\$[\s\S]*?\$\$/g, " ")
      .replace(/\$[^$\n]+\$/g, " ")
      // Remove markdown heading/list/blockquote symbols
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^[-*>]\s+/gm, "")
      // Remove import/export statements
      .replace(/^(import|export)\s+.+$/gm, "")
      // Remove footnote references
      .replace(/\[\^[^\]]+\]/g, " ")
      // Collapse punctuation/special chars to spaces
      .replace(/[^\w\s'-]/g, " ")
  );
}

/** Shannon entropy H = -Σ p(w) log₂(p(w)) over word frequencies. */
function shannonEntropy(words: string[]): number {
  if (words.length === 0) return 0;
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const n = words.length;
  let h = 0;
  for (const count of freq.values()) {
    const p = count / n;
    h -= p * Math.log2(p);
  }
  return h;
}

export function readingStats(body: string): ReadingStats {
  const prose = extractProse(body);
  // Normalise to lowercase for frequency analysis
  const words = prose
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1); // drop lone punctuation leftovers

  const tokens = Math.round(words.length * 1.3);
  const tokensK = `${(tokens / 1000).toFixed(1)}k`;
  const h = shannonEntropy(words);
  const entropy =
    h < 4.0 ? "low" :
    h < 5.5 ? "medium" :
    h < 7.0 ? "high" : "very high";

  return { words: words.length, tokens, tokensK, entropy };
}

// "Jun 2026" — month + year for blog meta lines.
export function monthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
