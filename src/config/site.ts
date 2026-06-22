// src/config/site.ts
// ─────────────────────────────────────────────────────────────────────────────
// Assembles the typed `site` config from raw values in `./constants`.
// THIS is the single import point for the rest of the app:
//   import { site } from "@config/site";
// Components/pages must read everything from here and never hardcode values.
// To change a value, edit `./constants` (not this file).
// ─────────────────────────────────────────────────────────────────────────────

import {
  NAME,
  TAGLINE,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  X_URL,
  SECTIONS,
  FOOTER_QUIP,
  SITE_URL,
  ABOUT,
  TEMPERATURE,
} from "./constants";

export interface Section {
  id: string;
  label: string;
  href: string;
}

export interface Site {
  name: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string;
  x: string;
  footerQuip: string;
  url: string;
  sections: Section[];
  about: typeof ABOUT;
  temperature: typeof TEMPERATURE;
}

export const site: Site = {
  name: NAME,
  tagline: TAGLINE,
  email: EMAIL,
  github: GITHUB_URL,
  linkedin: LINKEDIN_URL,
  x: X_URL,
  footerQuip: FOOTER_QUIP,
  url: SITE_URL,
  sections: [...SECTIONS],
  about: ABOUT,
  temperature: TEMPERATURE,
};
