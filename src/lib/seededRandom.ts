// src/lib/seededRandom.ts
// Mulberry32 deterministic PRNG. Fixed seed → identical sequence every run.
// Returns a function that produces floats in [0, 1) — same API as Math.random().
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
