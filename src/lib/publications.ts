// src/lib/publications.ts
// Loads + types the publications list from src/data/publications.yaml at build time.
// Publications are data, not a content collection (CLAUDE.md §7). Newest first.
// The YAML is inlined via Vite `?raw` so it works in the static build (no fs/runtime path).
import yaml from "js-yaml";
import raw from "../data/publications.yaml?raw";

export interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  order?: number;
  link?: string;
  pdf?: string;
  note?: string;
  thumbnail?: string;
}

export function getPublications(): Publication[] {
  const list = (yaml.load(raw) as Publication[]) ?? [];
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
